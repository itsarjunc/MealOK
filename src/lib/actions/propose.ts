"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, notifications, users, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  recipeIds: z.array(z.number()).min(1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
  dateString: z.string(), // YYYY-MM-DD
});

export async function proposeMeal(recipeIds: number[], mealType: string, dateString: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const householdId = parseInt(session.user.householdId);
  const userId = parseInt(session.user.id);
  
  const parsed = schema.parse({ recipeIds, mealType, dateString });

  let [plan] = await db.select().from(mealPlans).where(
    and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, parsed.dateString))
  );

  if (!plan) {
    [plan] = await db.insert(mealPlans).values({
      householdId,
      date: parsed.dateString,
      status: "PROPOSING",
    }).returning();
  }

  let [item] = await db.select().from(mealPlanItems).where(
    and(eq(mealPlanItems.mealPlanId, plan.id), eq(mealPlanItems.mealType, parsed.mealType), eq(mealPlanItems.householdId, householdId))
  );

  if (item) {
    throw new Error("A meal has already been proposed for this slot.");
  }

  [item] = await db.insert(mealPlanItems).values({
    mealPlanId: plan.id,
    householdId,
    mealType: parsed.mealType,
    recipeId: parsed.recipeIds[0], // Primary recipe for backward compat
    recipeIds: parsed.recipeIds, // All selected recipes
    state: "VOTING",
  }).returning();

  await db.insert(auditLogs).values({
    householdId,
    userId,
    action: "MEAL_PROPOSED",
    entityType: "meal_plan_item",
    entityId: item.id,
    details: { recipeIds: parsed.recipeIds, mealType: parsed.mealType },
  });

  const allUsers = await db.select().from(users).where(and(eq(users.householdId, householdId), eq(users.role, "RESIDENT")));
  
  const notifs = allUsers.filter(u => u.id !== userId).map(u => ({
    userId: u.id,
    householdId,
    type: "MEAL_PROPOSED",
    title: "New Meal Proposed",
    body: `${session.user.name} proposed a meal for ${parsed.mealType}.`,
    route: `/plan`,
    entityId: item.id
  }));

  if (notifs.length > 0) {
    await db.insert(notifications).values(notifs);
  }

  revalidatePath('/plan');
  revalidatePath('/home');
}
