import { db } from "@/db";
import { mealPlans, mealPlanItems, households } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { PublicTodayClient } from "./client";

export const dynamic = "force-dynamic";

export default async function PublicTodayPage() {
  // Get the first household as the default
  const [household] = await db.select().from(households).limit(1);
  if (!household) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <p className="text-foreground-muted font-medium text-center">No household configured.</p>
      </div>
    );
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [todayPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, household.id), eq(mealPlans.date, todayStr)));
  let items = todayPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, todayPlan.id)) : [];
  
  items = items.filter(i => ["FINALIZED", "COOKING", "COMPLETED"].includes(i.state));

  const enrichedItems = items.map(item => {
    const snapshot = item.calculatedIngredients as {
      recipe?: { name: string; instructions?: string | null; image?: string | null; calories?: number | null };
      recipes?: Array<{ name: string; instructions?: string | null; image?: string | null; calories?: number | null }>;
      ingredients?: Array<{ name: string; quantity: number; unit: string; recipeName?: string }>;
    } | null;
    
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
    <div className="flex flex-col min-h-screen bg-surface pb-16 md:pb-0 items-center">
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-20">
        <div className="pb-safe">
          {/* Header Branding */}
          <div className="flex items-center justify-center py-4 mb-4 select-none">
            <img src="/branding/Vector.svg" alt="Logo" className="h-10 w-auto" />
          </div>

          <PublicTodayClient items={enrichedItems} dateStr={format(new Date(), "EEEE, MMMM do")} />
        </div>
      </main>
    </div>
  );
}
