import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, users, recipes, recipeIngredients, ingredients, notifications, auditLogs, householdSettings } from "@/db/schema";
import { calculateTotalPortions } from "./portions";
import { and, eq } from "drizzle-orm";

export async function finalizeMealPlan(dateStr: string, householdId: number, finalizedByUserId: number) {
  let [plan] = await db.select().from(mealPlans).where(
    and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, dateStr))
  );

  if (!plan) {
    [plan] = await db.insert(mealPlans).values({
      householdId,
      date: dateStr, 
      status: "DRAFT"
    }).returning();
  } else if (plan.status === "FINALIZED") {
    return { status: "ALREADY_FINALIZED" };
  }

  const items = await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, plan.id));
  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));
  const allUsers = await db.select().from(users).where(eq(users.householdId, householdId));
  const allIngredients = await db.select().from(ingredients).where(eq(ingredients.householdId, householdId));
  const [settings] = await db.select().from(householdSettings).where(eq(householdSettings.householdId, householdId));

  if (!settings) throw new Error("Household settings not found.");

  const requiredSlots = ["BREAKFAST", "LUNCH", "DINNER"];
  const finalItemsToProcess = [];

  for (const slot of requiredSlots) {
    const existingItem = items.find(i => i.mealType === slot);
    let targetRecipeId = null;
    let source = "APPROVED";

    if (existingItem && existingItem.state === "APPROVED") {
      targetRecipeId = existingItem.recipeId;
      finalItemsToProcess.push({ item: existingItem, recipeId: targetRecipeId, source });
    } else {
      if (slot === "BREAKFAST") targetRecipeId = settings.fallbackBreakfastId;
      else if (slot === "LUNCH") targetRecipeId = settings.fallbackLunchId;
      else if (slot === "DINNER") targetRecipeId = settings.fallbackDinnerId;

      if (!targetRecipeId) {
        throw new Error(`Configuration Error: Missing fallback recipe for ${slot}`);
      }
      
      source = "FALLBACK";
      
      if (existingItem) {
        const [updated] = await db.update(mealPlanItems).set({ recipeId: targetRecipeId, source }).where(eq(mealPlanItems.id, existingItem.id)).returning();
        finalItemsToProcess.push({ item: updated, recipeId: targetRecipeId, source });
      } else {
        const [inserted] = await db.insert(mealPlanItems).values({
          mealPlanId: plan.id,
          householdId,
          mealType: slot,
          recipeId: targetRecipeId,
          source,
          state: "PROPOSING"
        }).returning();
        finalItemsToProcess.push({ item: inserted, recipeId: targetRecipeId, source });
      }
    }
  }

  let fallbackCount = 0;

  for (const { item, recipeId, source } of finalItemsToProcess) {
    const attendances = await db.select().from(mealAttendance).where(eq(mealAttendance.mealPlanItemId, item.id));
    const totalServings = calculateTotalPortions(attendances, allUsers);

    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) throw new Error(`Recipe not found for slot ${item.mealType}`);

    const ings = await db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, recipe.id));
    const scaleFactor = recipe.baseServings > 0 ? (totalServings / recipe.baseServings) : 0;
    
    const snapshotIngredients = ings.map(ing => {
      const iDef = allIngredients.find(i => i.id === ing.ingredientId);
      return {
        name: iDef?.name || "Unknown Ingredient",
        quantity: ing.quantity * scaleFactor,
        unit: ing.unit
      };
    });

    const frozenSnapshot = {
      recipe: {
        name: recipe.name,
        instructions: recipe.instructions,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
      },
      ingredients: snapshotIngredients
    };

    await db.update(mealPlanItems).set({
      state: "FINALIZED",
      totalServings,
      quantityCalculatedAt: new Date(),
      calculatedIngredients: frozenSnapshot,
      source
    }).where(eq(mealPlanItems.id, item.id));

    if (source === "FALLBACK") {
      fallbackCount++;
      await db.insert(auditLogs).values({
        householdId,
        userId: finalizedByUserId,
        action: "MEAL_FALLBACK_USED",
        entityType: "meal_plan_item",
        entityId: item.id,
        details: { mealType: item.mealType, fallbackRecipeId: recipeId, reason: "NO_APPROVED_MEAL" }
      });
    }

    await db.insert(auditLogs).values({
      householdId,
      userId: finalizedByUserId,
      action: "MEAL_FINALIZED",
      entityType: "meal_plan_item",
      entityId: item.id,
      details: { totalServings, scaleFactor, source }
    });
  }

  await db.update(mealPlans).set({ status: "FINALIZED" }).where(eq(mealPlans.id, plan.id));

  const allCooks = allUsers.filter(u => u.role === "COOK");
  for (const cook of allCooks) {
    await db.insert(notifications).values({
      userId: cook.id,
      householdId,
      type: "DAY_FINALIZED",
      title: "New Cooking Plan",
      body: `The cooking plan for ${dateStr} is finalized.`,
      route: `/cook/today`
    });
  }

  const residents = allUsers.filter(u => u.role === "RESIDENT");
  for (const resident of residents) {
    let body = `The meal plan for ${dateStr} has been finalized.`;
    if (fallbackCount > 0) {
      body += ` ${fallbackCount} meal(s) are using household fallback recipes.`;
    }
    await db.insert(notifications).values({
      userId: resident.id,
      householdId,
      type: "DAY_FINALIZED",
      title: "Plan Finalized",
      body,
      route: `/plan`
    });
  }

  return { status: "SUCCESS" };
}
