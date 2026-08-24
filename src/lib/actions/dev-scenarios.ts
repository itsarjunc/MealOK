"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, recipes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { format, addDays } from "date-fns";

export async function setupScenario(type: "A" | "B") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const householdId = parseInt(session.user.householdId);
  const dateStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  // Wipe tomorrow's existing items first to avoid conflicts
  const [plan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, dateStr)));
  if (plan) {
    await db.delete(mealPlanItems).where(eq(mealPlanItems.mealPlanId, plan.id));
    await db.update(mealPlans).set({ status: "DRAFT" }).where(eq(mealPlans.id, plan.id));
  } else {
    await db.insert(mealPlans).values({ householdId, date: dateStr, status: "DRAFT" }).returning();
  }

  const currentPlan = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, dateStr))).then(r => r[0]);

  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));
  const dinnerRecipe = allRecipes.find(r => r.mealTypes.includes("DINNER"));
  if (!dinnerRecipe) throw new Error("No dinner recipe found");

  if (type === "A") {
    // Scenario A: Approved Dinner
    await db.insert(mealPlanItems).values({
      mealPlanId: currentPlan.id,
      householdId,
      mealType: "DINNER",
      recipeId: dinnerRecipe.id,
      state: "APPROVED",
      source: "APPROVED"
    });
  } else if (type === "B") {
    // Scenario B: Voting failed Dinner
    await db.insert(mealPlanItems).values({
      mealPlanId: currentPlan.id,
      householdId,
      mealType: "DINNER",
      recipeId: dinnerRecipe.id,
      state: "VOTING",
      source: "APPROVED"
    });
  }
}
