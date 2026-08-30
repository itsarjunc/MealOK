"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealVotes, mealPlanItems, mealPlans, households, notifications, users, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertPlanningOpen } from "@/lib/domain/planning";

export async function castVote(mealPlanItemId: number, vote: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  const householdId = parseInt(session.user.householdId);

  const [item] = await db.select().from(mealPlanItems).where(
    and(eq(mealPlanItems.id, mealPlanItemId), eq(mealPlanItems.householdId, householdId))
  );

  if (!item) throw new Error("Meal plan item not found");
  if (item.state !== "VOTING") throw new Error("Meal is not open for voting");

  const [plan] = await db.select().from(mealPlans).where(
    and(eq(mealPlans.id, item.mealPlanId), eq(mealPlans.householdId, householdId))
  );
  if (!plan) throw new Error("Meal plan not found");
  assertPlanningOpen(plan.date);

  const existing = await db.select().from(mealVotes).where(
    and(eq(mealVotes.mealPlanItemId, mealPlanItemId), eq(mealVotes.userId, userId))
  );

  if (existing.length > 0) {
    await db.update(mealVotes).set({ vote }).where(eq(mealVotes.id, existing[0].id));
  } else {
    await db.insert(mealVotes).values({
      userId,
      householdId,
      mealPlanItemId,
      vote,
    });
  }

  await db.insert(auditLogs).values({
    householdId,
    userId,
    action: "VOTE_CAST",
    entityType: "meal_plan_item",
    entityId: mealPlanItemId,
    details: { vote }
  });

  const [household] = await db.select().from(households).where(eq(households.id, householdId));
  const threshold = household.approvalThreshold;

  const allVotes = await db.select().from(mealVotes).where(eq(mealVotes.mealPlanItemId, mealPlanItemId));
  const approveCount = allVotes.filter(v => v.vote === "APPROVED").length;

  if (approveCount >= threshold) {
    await db.update(mealPlanItems).set({ state: "APPROVED" }).where(eq(mealPlanItems.id, mealPlanItemId));
    
    await db.insert(auditLogs).values({
      householdId,
      userId: -1, // System action
      action: "MEAL_APPROVED_THRESHOLD",
      entityType: "meal_plan_item",
      entityId: mealPlanItemId,
      details: { approveCount, threshold }
    });

    const allUsers = await db.select().from(users).where(and(eq(users.householdId, householdId), eq(users.role, "RESIDENT")));
    
    const notifs = allUsers.map(u => ({
      userId: u.id,
      householdId,
      type: "MEAL_APPROVED",
      title: "Meal Approved",
      body: `A meal for ${item.mealType} has reached the approval threshold.`,
      route: `/plan`,
      entityId: item.id
    }));
    await db.insert(notifications).values(notifs);
  }

  revalidatePath('/plan');
  revalidatePath('/home');
}
