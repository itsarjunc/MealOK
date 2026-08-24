import 'dotenv/config';
import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { db } from '../src/db';
import { households, users, recipes, householdSettings, mealPlans, mealPlanItems, mealVotes, auditLogs, notifications } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { finalizeMealPlan } from '../src/lib/domain/finalize';

describe('Finalization Domain Service', () => {
  let testHouseholdId: number;
  let testUserId: number;
  let recipeAId: number;
  let recipeFallbackId: number;

  beforeAll(async () => {
    // Create isolated test data
    const [hh] = await db.insert(households).values({ name: 'Test Finalize HH', approvalThreshold: 1 }).returning();
    testHouseholdId = hh.id;

    const [u] = await db.insert(users).values({ householdId: testHouseholdId, name: 'TestUser', email: 'test@mealok.local', passwordHash: '123' }).returning();
    testUserId = u.id;

    const [r1] = await db.insert(recipes).values({ householdId: testHouseholdId, name: 'Approved Recipe', baseServings: 1 }).returning();
    recipeAId = r1.id;

    const [r2] = await db.insert(recipes).values({ householdId: testHouseholdId, name: 'Fallback Recipe', baseServings: 1 }).returning();
    recipeFallbackId = r2.id;

    await db.insert(householdSettings).values({
      householdId: testHouseholdId,
      fallbackBreakfastId: recipeFallbackId,
      fallbackLunchId: recipeFallbackId,
      fallbackDinnerId: recipeFallbackId,
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(auditLogs).where(eq(auditLogs.householdId, testHouseholdId));
    await db.delete(notifications).where(eq(notifications.householdId, testHouseholdId));
    await db.delete(mealPlanItems).where(eq(mealPlanItems.householdId, testHouseholdId));
    await db.delete(mealPlans).where(eq(mealPlans.householdId, testHouseholdId));
    await db.delete(householdSettings).where(eq(householdSettings.householdId, testHouseholdId));
    await db.delete(recipes).where(eq(recipes.householdId, testHouseholdId));
    await db.delete(users).where(eq(users.householdId, testHouseholdId));
    await db.delete(households).where(eq(households.id, testHouseholdId));
  });

  test('Scenario C: No proposal exists -> uses fallback', async () => {
    const res = await finalizeMealPlan("2030-01-01", testHouseholdId, testUserId);
    expect(res.status).toBe("SUCCESS");

    const plans = await db.select().from(mealPlans).where(eq(mealPlans.date, "2030-01-01"));
    expect(plans.length).toBe(1);
    expect(plans[0].status).toBe("FINALIZED");

    const items = await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, plans[0].id));
    expect(items.length).toBe(3); // Breakfast, Lunch, Dinner
    expect(items[0].source).toBe("FALLBACK");
    expect(items[0].recipeId).toBe(recipeFallbackId);
  });

  test('Scenario D: Idempotency -> running again safely returns ALREADY_FINALIZED', async () => {
    const res = await finalizeMealPlan("2030-01-01", testHouseholdId, testUserId);
    expect(res.status).toBe("ALREADY_FINALIZED");

    // Count should still be 3
    const plans = await db.select().from(mealPlans).where(eq(mealPlans.date, "2030-01-01"));
    const items = await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, plans[0].id));
    expect(items.length).toBe(3);
  });

  test('Scenario A/B: Approved meal wins over fallback, voting failed uses fallback', async () => {
    // Setup another date
    const [plan] = await db.insert(mealPlans).values({ householdId: testHouseholdId, date: "2030-01-02", status: "DRAFT" }).returning();
    
    // 1. Breakfast: Approved
    await db.insert(mealPlanItems).values({
      mealPlanId: plan.id, householdId: testHouseholdId, mealType: "BREAKFAST", recipeId: recipeAId, state: "APPROVED", source: "APPROVED"
    });

    // 2. Lunch: Still Voting (meaning it failed to reach threshold before finalization)
    await db.insert(mealPlanItems).values({
      mealPlanId: plan.id, householdId: testHouseholdId, mealType: "LUNCH", recipeId: recipeAId, state: "VOTING", source: "APPROVED"
    });

    // 3. Dinner: No proposal (handled by fallback logic automatically)

    await finalizeMealPlan("2030-01-02", testHouseholdId, testUserId);

    const items = await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, plan.id));
    
    const bf = items.find(i => i.mealType === "BREAKFAST");
    expect(bf?.state).toBe("FINALIZED");
    expect(bf?.source).toBe("APPROVED");
    expect(bf?.recipeId).toBe(recipeAId);

    const lunch = items.find(i => i.mealType === "LUNCH");
    expect(lunch?.state).toBe("FINALIZED");
    expect(lunch?.source).toBe("FALLBACK");
    expect(lunch?.recipeId).toBe(recipeFallbackId); // It was overwritten!

    const dinner = items.find(i => i.mealType === "DINNER");
    expect(dinner?.state).toBe("FINALIZED");
    expect(dinner?.source).toBe("FALLBACK");
    expect(dinner?.recipeId).toBe(recipeFallbackId);
  });
});
