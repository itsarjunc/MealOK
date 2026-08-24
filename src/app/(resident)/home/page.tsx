import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, notifications, recipes, users } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { format, addDays } from "date-fns";
import Link from "next/link";
import { Bell, AlertTriangle } from "lucide-react";
import { HomeClient } from "./client";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);
  const userId = parseInt(session.user.id);
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [todayPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, todayStr)));
  let todayItems = todayPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, todayPlan.id)) : [];

  const [tomorrowPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, tomorrowStr)));
  let tomorrowItems = tomorrowPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, tomorrowPlan.id)) : [];

  const allItemIds = [...todayItems, ...tomorrowItems].map(i => i.id);
  let userAttendances = allItemIds.length > 0 ? await db.select().from(mealAttendance).where(and(
    eq(mealAttendance.userId, userId)
  )) : [];

  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));
  const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);

  let totalCal = 0, totalPro = 0;
  todayItems.forEach(item => {
    const att = userAttendances.find(a => a.mealPlanItemId === item.id);
    if (att && att.status === "EATING") {
      const mult = att.portionOverride ?? user?.defaultPortion ?? 1;
      const recipe = allRecipes.find(r => r.id === item.recipeId);
      if (recipe) {
        totalCal += (recipe.calories || 0) * mult;
        totalPro += (recipe.protein || 0) * mult;
      }
    }
  });
  const nutrition = { cal: Math.round(totalCal), pro: Math.round(totalPro) };

  const notifs = await db.select().from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return (
    <div className="pb-safe bg-surface-muted min-h-screen">
      <div className="bg-surface pt-12 pb-4 px-4 sticky top-0 z-10 border-b border-border flex justify-between items-center">
        <div>
          <p className="text-foreground-muted text-sm font-medium">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'},</p>
          <h1 className="text-2xl font-extrabold text-foreground">{session.user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/plan" className="bg-gradient-to-b from-zomato to-[#c52c38] text-white text-xs font-bold px-3 py-2 rounded-xl border-b-2 border-[#9c1822] active:translate-y-[1px] active:border-b transition-all shadow-sm shadow-zomato/15">
            Confirm Availability
          </Link>
          <Link href="/notifications" className="relative p-2 bg-surface-muted rounded-full hover:bg-border transition flex items-center justify-center">
            <Bell className="h-5 w-5 text-foreground-muted" />
            {notifs.length > 0 && (
              <span className="absolute top-0 right-0 bg-zomato text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-surface">
                {notifs.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 pb-24">
        {tomorrowItems.some(i => i.state === "VOTING") && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-orange-800">Action Required</h3>
              <p className="text-sm text-orange-700 mb-2">Meals for tomorrow need your vote.</p>
              <Link href="/plan" className="text-sm font-bold text-white bg-zomato px-3.5 py-1.5 rounded-xl hover:bg-zomato-dark transition active:scale-95 border-b-2 border-[#9c1822] inline-block">Review Tomorrow's Plan</Link>
            </div>
          </div>
        )}

        <HomeClient todayItems={todayItems} tomorrowItems={tomorrowItems} userAttendances={userAttendances} tomorrowPlanState={tomorrowPlan?.status || "NO_PLAN"} nutrition={nutrition} />
      </div>
    </div>
  );
}
