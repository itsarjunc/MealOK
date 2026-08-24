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
    const recipe = allRecipes.find(r => r.id === item.recipeId);
    const itemAttendances = await db.select().from(mealAttendance).where(eq(mealAttendance.mealPlanItemId, item.id));
    const userAtt = itemAttendances.find(a => a.userId === userId);
    
    const votes = await db.select().from(mealVotes).where(eq(mealVotes.mealPlanItemId, item.id));
    const userVote = votes.find(v => v.userId === userId);
    const approveCount = votes.filter(v => v.vote === "APPROVED").length;
    
    const eatingCount = itemAttendances.filter(a => a.status === "EATING").length;

    return {
      ...item,
      recipe,
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
    <div className="pb-safe min-h-screen bg-surface-muted">
      <div className="bg-surface pt-12 pb-4 px-4 border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Tomorrow's Plan</h1>
        <p className="text-foreground-muted font-medium text-sm mt-0.5">{format(addDays(new Date(), 1), "EEEE, MMMM do")}</p>
      </div>
      <div className="flex flex-col gap-4 p-4 pb-24">
        <PlanClient slots={slots} recipes={allRecipes} planStatus={tomorrowPlan?.status || "NO_PLAN"} dateStr={tomorrowStr} />
      </div>
    </div>
  );
}
