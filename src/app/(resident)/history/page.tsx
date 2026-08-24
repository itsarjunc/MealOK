import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);

  const plans = await db.select().from(mealPlans)
    .where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.status, "FINALIZED")))
    .orderBy(desc(mealPlans.date))
    .limit(30);

  const planIds = plans.map(p => p.id);
  const items = planIds.length > 0 
    ? await db.select().from(mealPlanItems).where(and(eq(mealPlanItems.householdId, householdId))) 
    : [];
  
  return (
    <div className="pb-safe min-h-screen bg-surface">
      <div className="bg-surface pt-12 pb-4 px-4 border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Meal History</h1>
      </div>
      <div className="flex flex-col pb-24">
        {plans.length === 0 && (
          <p className="text-center text-foreground-muted py-8 font-medium">No finalized meals yet.</p>
        )}
        {plans.map(plan => {
          const planItems = items.filter(i => i.mealPlanId === plan.id);
          return (
            <div key={plan.id} className="bg-surface border-b border-border">
              <div className="bg-surface-muted px-4 py-3 border-b border-border">
                <h2 className="font-extrabold text-foreground tracking-tight">
                  {format(new Date(plan.date), "EEEE, MMMM do")}
                </h2>
              </div>
              <div className="divide-y divide-border">
                {["BREAKFAST", "LUNCH", "DINNER"].map(slot => {
                  const item = planItems.find(i => i.mealType === slot);
                  if (!item) return null;
                  const snapshot = item.calculatedIngredients as any;
                  const recipe = snapshot?.recipe || { name: "Unknown" };
                  
                  return (
                    <div key={slot} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">{slot}</p>
                        <p className="font-extrabold text-foreground">{recipe.name}</p>
                        {item.source === "FALLBACK" && (
                          <span className="inline-block mt-1 text-[10px] bg-red-50 text-zomato px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border border-red-100">
                            Fallback Meal Used
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground-muted">{recipe.calories || 0} kcal</p>
                        <p className="text-xs font-medium text-foreground-muted">{recipe.protein || 0}g protein</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
