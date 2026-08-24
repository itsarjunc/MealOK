"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createRecipe(formData: {
  name: string;
  mealTypes: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const householdId = parseInt(session.user.householdId);

  await db.insert(recipes).values({
    householdId,
    name: formData.name,
    mealTypes: formData.mealTypes,
    calories: formData.calories,
    protein: formData.protein,
    carbs: formData.carbs,
    fat: formData.fat,
    instructions: formData.instructions,
    baseServings: 1,
  });

  revalidatePath("/meals");
}
