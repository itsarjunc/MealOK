"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Beef, CheckCircle2, Flame, UtensilsCrossed } from "lucide-react";

type MealItem = {
  id: number;
  mealType: string;
  state: string;
  recipeNames?: string[];
};

type Attendance = {
  mealPlanItemId: number;
  status: string;
};

type Nutrition = {
  cal: number;
  pro: number;
};

type HomeClientProps = {
  todayItems: MealItem[];
  tomorrowItems: MealItem[];
  userAttendances: Attendance[];
  tomorrowPlanState: string;
  nutrition: Nutrition;
};

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border-green-100",
  COOKING: "bg-amber-50 text-amber-700 border-amber-100",
  FINALIZED: "bg-blue-50 text-blue-700 border-blue-100",
  APPROVED: "bg-surface-muted text-foreground-muted border-border",
};

function formatMealType(mealType: string) {
  return mealType.charAt(0) + mealType.slice(1).toLowerCase();
}

function MealRow({ item, attendance }: { item: MealItem; attendance?: Attendance }) {
  const statusClass = statusStyles[item.state] || "bg-surface-muted text-foreground-muted border-border";

  return (
    <motion.div whileTap={{ scale: 0.99 }} className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border" />
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground-muted">{formatMealType(item.mealType)}</p>
          <h3 className="mt-1 truncate text-base font-extrabold tracking-tight text-foreground">
            {item.recipeNames?.length ? item.recipeNames.join(" + ") : "Meal not selected"}
          </h3>
          <p className="mt-1 text-xs font-medium text-foreground-muted">
            Attendance: <span className="font-bold text-foreground">{attendance?.status || "Not set"}</span>
          </p>
        </div>
      </div>
      <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${statusClass}`}>
        {item.state === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
        {item.state.toLowerCase()}
      </span>
    </motion.div>
  );
}

export function HomeClient({ todayItems, tomorrowItems, userAttendances, nutrition }: HomeClientProps) {
  const attendanceFor = (item: MealItem) => userAttendances.find((attendance) => attendance.mealPlanItemId === item.id);

  return (
    <div className="grid gap-5 md:grid-cols-[1.35fr_1fr] md:items-start">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <div className="border-b border-border px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground-muted">Today</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Your meals</h2>
            </div>
            <div className="flex gap-2 rounded-2xl bg-surface-muted px-3 py-2 text-[10px] font-bold text-foreground-muted">
              <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-foreground-muted" />{nutrition.cal}</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1"><Beef className="h-3.5 w-3.5 text-foreground-muted" />{nutrition.pro}g</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-foreground-muted">Your nutrition estimate for the meals you&apos;re eating.</p>
        </div>

        <div className="px-5">
          {todayItems.length === 0 ? (
            <EmptyState message="No meals planned for today." />
          ) : (
            todayItems.map((item) => <MealRow key={item.id} item={item} attendance={attendanceFor(item)} />)
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <div className="border-b border-border px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted"><UtensilsCrossed className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground-muted">Tomorrow</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-foreground">Coming up</h2>
            </div>
          </div>
        </div>
        <div className="px-5">
          {tomorrowItems.length === 0 ? (
            <EmptyState message="Nothing planned yet." />
          ) : (
            tomorrowItems.map((item) => <MealRow key={item.id} item={item} attendance={attendanceFor(item)} />)
          )}
        </div>
        <Link href="/plan" className="mx-5 mb-5 mt-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs font-extrabold text-foreground transition hover:bg-border">
          Manage tomorrow&apos;s plan <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted"><UtensilsCrossed className="h-5 w-5" /></div>
      <p className="text-sm font-semibold text-foreground-muted">{message}</p>
      {action && <Link href="/plan" className="text-xs font-extrabold text-zomato hover:text-zomato-dark">{action} <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>}
    </div>
  );
}
