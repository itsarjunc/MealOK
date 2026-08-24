"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, mealVotes, notifications, auditLogs, cookConfirmations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (process.env.NODE_ENV !== "development") throw new Error("Forbidden in production");

  const householdId = parseInt(session.user.householdId);

  // Wipe all transaction data, keeping household, users, and recipes
  await db.delete(notifications).where(eq(notifications.householdId, householdId));
  await db.delete(auditLogs).where(eq(auditLogs.householdId, householdId));
  await db.delete(mealAttendance).where(eq(mealAttendance.householdId, householdId));
  await db.delete(mealVotes).where(eq(mealVotes.householdId, householdId));
  await db.delete(mealPlanItems).where(eq(mealPlanItems.householdId, householdId));
  await db.delete(cookConfirmations).where(eq(cookConfirmations.householdId, householdId));
  await db.delete(mealPlans).where(eq(mealPlans.householdId, householdId));

  revalidatePath('/', 'layout');
}
