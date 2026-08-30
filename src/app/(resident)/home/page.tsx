import { auth } from "@/auth";
import { db } from "@/db";
import { mealPlans, mealPlanItems, mealAttendance, notifications, recipes, users } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { format, addDays } from "date-fns";
import Link from "next/link";
import { Bell, ArrowUpRight, AlertTriangle } from "lucide-react";
import { HomeClient } from "./client";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);
  const userId = parseInt(session.user.id);
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [todayPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, todayStr)));
  const todayItems = todayPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, todayPlan.id)) : [];

  const [tomorrowPlan] = await db.select().from(mealPlans).where(and(eq(mealPlans.householdId, householdId), eq(mealPlans.date, tomorrowStr)));
  const tomorrowItems = tomorrowPlan ? await db.select().from(mealPlanItems).where(eq(mealPlanItems.mealPlanId, tomorrowPlan.id)) : [];

  const allItemIds = [...todayItems, ...tomorrowItems].map(i => i.id);
  const userAttendances = allItemIds.length > 0 ? await db.select().from(mealAttendance).where(and(
    eq(mealAttendance.userId, userId)
  )) : [];

  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));
  const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);

  let totalCal = 0, totalPro = 0;
  todayItems.forEach(item => {
    const att = userAttendances.find(a => a.mealPlanItemId === item.id);
    if (att && att.status === "EATING") {
      const mult = att.portionOverride ?? user?.defaultPortion ?? 1;
      const itemRecipeIds: number[] = (item.recipeIds as number[]) || [item.recipeId];
      for (const rid of itemRecipeIds) {
        const recipe = allRecipes.find(r => r.id === rid);
        if (recipe) {
          totalCal += (recipe.calories || 0) * mult;
          totalPro += (recipe.protein || 0) * mult;
        }
      }
    }
  });
  const nutrition = { cal: Math.round(totalCal), pro: Math.round(totalPro) };

  const notifs = await db.select().from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  // Enrich items with recipe names for multi-item display
  const enrichItem = (item: typeof todayItems[number]) => {
    const ids: number[] = (item.recipeIds as number[]) || [item.recipeId];
    const names = ids.map(id => allRecipes.find(r => r.id === id)?.name).filter((name): name is string => Boolean(name));
    return { ...item, recipeNames: names };
  };
  const enrichedTodayItems = todayItems.map(enrichItem);
  const enrichedTomorrowItems = tomorrowItems.map(enrichItem);

  return (
    <div className="pb-safe bg-surface-muted min-h-screen">
      <div className="bg-surface px-4 pb-4 pt-5 md:pt-8">
        <div className="flex items-center justify-between">
          <img src="/branding/Vector.svg" alt="MealOK" className="h-8 w-auto" />
          <Link href="/notifications" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-muted transition hover:bg-border">
            <Bell className="h-5 w-5 text-foreground" />
            {notifs.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-zomato text-[10px] font-bold text-white">
                {notifs.length}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="bg-surface-muted px-4 pb-6 pt-5">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {session.user.name}</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">Here&apos;s what&apos;s happening around the kitchen.</p>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-20">
        {tomorrowItems.some(i => i.state === "VOTING") && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-foreground-muted" />
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Tomorrow needs your vote</h3>
                <p className="mt-0.5 text-xs font-medium text-foreground-muted">Help choose what the household cooks.</p>
              </div>
            </div>
            <Link href="/plan" className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-foreground">Review <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        )}

        <HomeClient todayItems={enrichedTodayItems} tomorrowItems={enrichedTomorrowItems} userAttendances={userAttendances} tomorrowPlanState={tomorrowPlan?.status || "NO_PLAN"} nutrition={nutrition} />
      </div>
    </div>
  );
}
