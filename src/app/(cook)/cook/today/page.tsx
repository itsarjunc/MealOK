import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { CookClient } from "./client";

export default async function CookTodayPage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [todayPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, todayStr)));
  let items = todayPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, todayPlan.id)) : [];
  
  items = items.filter(i => ["FINALIZED", "COOKING", "COMPLETED"].includes(i.state));

  const enrichedItems = items.map(item => {
    const snapshot = item.calculatedIngredients as any;
    
    return {
      id: item.id,
      mealType: item.mealType,
      state: item.state,
      totalServings: item.totalServings,
      recipe: snapshot?.recipe || { name: "Unknown", instructions: "No instructions available" },
      ingredients: snapshot?.ingredients || []
    };
  });

  return (
    <div className="pb-safe min-h-screen bg-surface">
      <div className="bg-surface pt-12 pb-4 px-4 sticky top-0 z-10 border-b border-border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Today's Cooking</h1>
          <p className="text-foreground-muted font-medium text-sm mt-0.5">{format(new Date(), "EEEE, MMMM do")}</p>
        </div>
      </div>
      <div className="flex flex-col pb-24">
        <CookClient items={enrichedItems} />
      </div>
    </div>
  );
}
