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
      snapshot: snapshot || null,
      ingredients: snapshot?.ingredients || []
    };
  });

  return (
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface-muted px-4 pb-6 pt-5 md:pt-10">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Kitchen board</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Today&apos;s cooking</h1>
          <p className="mt-1 text-sm font-medium text-foreground-muted">{format(new Date(), "EEEE, MMMM do")}</p>
        </div>
      </div>
      <div className="flex flex-col pb-24">
        <CookClient items={enrichedItems} />
      </div>
    </div>
  );
}
