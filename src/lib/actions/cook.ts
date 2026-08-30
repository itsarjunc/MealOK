"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlanItems, notifications, users, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCookStatus(mealPlanItemId: number, status: "COOKING" | "COMPLETED") {
  const session = await auth();
  if (!session?.user || session.user.role !== "COOK") throw new Error("Unauthorized");

  const householdId = parseInt(session.user.householdId);

  const [item] = await db.select().from(mealPlanItems).where(
    and(eq(mealPlanItems.id, mealPlanItemId), eq(mealPlanItems.householdId, householdId))
  );

  if (!item) throw new Error("Item not found");

  await db.update(mealPlanItems).set({ state: status }).where(eq(mealPlanItems.id, item.id));

  await db.insert(auditLogs).values({
    householdId,
    userId: parseInt(session.user.id),
    action: "COOK_STATUS_UPDATED",
    entityType: "meal_plan_item",
    entityId: mealPlanItemId,
    details: { status }
  });

  if (status === "COOKING") {
    const allUsers = await db.select().from(users).where(and(eq(users.householdId, householdId), eq(users.role, "RESIDENT")));
    const notifs = allUsers.map(u => ({
      userId: u.id,
      householdId,
      type: "MEAL_COOKING",
      title: "Cooking Started",
      body: `The cook has started preparing ${item.mealType}.`,
      route: `/home`
    }));
    await db.insert(notifications).values(notifs);
  }

  revalidatePath('/cook/today');
}
