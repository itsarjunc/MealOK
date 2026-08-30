import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, recipes, mealVotes, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { format, addDays } from "date-fns";
import { PlanClient } from "./client";

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);
  const userId = parseInt(session.user.id);
  
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [tomorrowPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, tomorrowStr)));
  
  let items = tomorrowPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, tomorrowPlan.id)) : [];
  
  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));
  
  const enrichedItems = await Promise.all(items.map(async (item) => {
    // Resolve all recipes for multi-item meals
    const itemRecipeIds: number[] = (item.recipeIds as number[]) || [item.recipeId];
    const resolvedRecipes = itemRecipeIds
      .map(id => allRecipes.find(r => r.id === id))
      .filter(Boolean);

    const itemAttendances = await db.select().from(mealAttendance).where(eq(mealAttendance.mealPlanItemId, item.id));
    const userAtt = itemAttendances.find(a => a.userId === userId);
    
    const votes = await db.select().from(mealVotes).where(eq(mealVotes.mealPlanItemId, item.id));
    const userVote = votes.find(v => v.userId === userId);
    const approveCount = votes.filter(v => v.vote === "APPROVED").length;
    
    const eatingCount = itemAttendances.filter(a => a.status === "EATING").length;

    return {
      ...item,
      recipe: resolvedRecipes[0] || null, // Primary recipe for backward compat
      recipes: resolvedRecipes, // All recipes in the combo
      userAttendance: userAtt?.status || null,
      eatingCount,
      userVote: userVote?.vote || null,
      approveCount,
    };
  }));

  const slots = ["BREAKFAST", "LUNCH", "DINNER"].map(type => {
    const existing = enrichedItems.find(i => i.mealType === type);
    return existing || { mealType: type, state: "EMPTY" };
  });

  return (
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface px-4 pb-5 pt-8 md:pt-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Planning ahead</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Tomorrow&apos;s plan</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">{format(addDays(new Date(), 1), "EEEE, MMMM do")}</p>
      </div>
      <div className="flex flex-col gap-4 p-4 pb-24">
        <PlanClient slots={slots} recipes={allRecipes} planStatus={tomorrowPlan?.status || "NO_PLAN"} dateStr={tomorrowStr} />
      </div>
    </div>
  );
}
