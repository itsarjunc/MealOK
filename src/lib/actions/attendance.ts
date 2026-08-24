"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealAttendance, mealPlanItems, auditLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function setAttendance(mealPlanItemId: number, status: "EATING" | "NOT_EATING" | "MAYBE") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  const householdId = parseInt(session.user.householdId);

  const [item] = await db.select().from(mealPlanItems).where(
    and(eq(mealPlanItems.id, mealPlanItemId), eq(mealPlanItems.householdId, householdId))
  );

  if (!item) throw new Error("Meal plan item not found");
  if (item.state === "FINALIZED" || item.state === "COOKING" || item.state === "COMPLETED") {
    throw new Error("Cannot modify attendance for a finalized meal. A change request is required.");
  }

  const existing = await db.select().from(mealAttendance).where(
    and(
      eq(mealAttendance.userId, userId),
      eq(mealAttendance.mealPlanItemId, mealPlanItemId),
      eq(mealAttendance.householdId, householdId)
    )
  );

  if (existing.length > 0) {
    await db.update(mealAttendance)
      .set({ status })
      .where(eq(mealAttendance.id, existing[0].id));
  } else {
    await db.insert(mealAttendance).values({
      userId,
      householdId,
      mealPlanItemId,
      status,
    });
  }

  await db.insert(auditLogs).values({
    householdId,
    userId,
    action: "ATTENDANCE_SET",
    entityType: "meal_plan_item",
    entityId: mealPlanItemId,
    details: { status }
  });

  revalidatePath('/plan');
  revalidatePath('/home');
}
