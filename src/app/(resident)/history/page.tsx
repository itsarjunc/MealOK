import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { CalendarDays, Flame, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface px-4 pb-5 pt-8 md:pt-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Your kitchen</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Meal history</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">A look back at finalized household menus.</p>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-5">
        {plans.length === 0 && (
          <div className="rounded-[2rem] border border-border bg-surface px-6 py-16 text-center shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <CalendarDays className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="mt-4 text-sm font-bold text-foreground">No finalized meals yet</p>
            <p className="mt-1 text-xs font-medium text-foreground-muted">Completed menus will appear here.</p>
          </div>
        )}
        {plans.map(plan => {
          const planItems = items.filter(i => i.mealPlanId === plan.id);
          return (
            <div key={plan.id} className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-muted text-foreground">
                  <span className="text-[9px] font-extrabold uppercase">{format(new Date(plan.date), "MMM")}</span>
                  <span className="text-sm font-black leading-none">{format(new Date(plan.date), "d")}</span>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-foreground-muted">Finalized menu</p>
                  <h2 className="mt-0.5 font-extrabold tracking-tight text-foreground">{format(new Date(plan.date), "EEEE, MMMM do")}</h2>
                </div>
              </div>
              <div className="divide-y divide-border">
                {["BREAKFAST", "LUNCH", "DINNER"].map(slot => {
                  const item = planItems.find(i => i.mealType === slot);
                  if (!item) return null;
                  const snapshot = item.calculatedIngredients as any;
                  const recipe = snapshot?.recipe || { name: "Unknown" };
                  
                  return (
                      <div key={slot} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-1">{slot}</p>
                        <p className="font-extrabold text-foreground">{recipe.name}</p>
                        {item.source === "FALLBACK" && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
                            <ShieldAlert className="h-3 w-3" /> Fallback meal
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-xs font-medium text-foreground-muted"><Flame className="h-3 w-3" />{recipe.calories || 0} kcal</p>
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
