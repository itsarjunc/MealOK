"use server"

import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, users, recipes, recipeIngredients, notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { finalizeMealPlan } from "@/lib/domain/finalize";
import { format, addDays } from "date-fns";

export async function finalizeTomorrow() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const householdId = parseInt(session.user.householdId);
  const userId = parseInt(session.user.id);
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  await finalizeMealPlan(tomorrowStr, householdId, userId);

  revalidatePath('/plan');
  revalidatePath('/home');
  revalidatePath('/cook/today');
}
