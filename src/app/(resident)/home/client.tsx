"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Beef } from "lucide-react";

export function HomeClient({ todayItems, tomorrowItems, userAttendances, tomorrowPlanState, nutrition }: any) {
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Today's Meals</h2>
          <div className="flex gap-2.5 items-center text-[11px] font-bold text-foreground bg-surface-muted px-2.5 py-1.5 rounded-lg border border-border">
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" /> {nutrition?.cal || 0} kcal</span>
            <span className="text-border">|</span>
            <span className="text-zomato flex items-center gap-1"><Beef className="h-3.5 w-3.5 text-zomato" /> {nutrition?.pro || 0}g protein</span>
          </div>
        </div>
        {todayItems.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <p className="text-foreground-muted font-medium">No meals planned for today.</p>
            <Link 
              href="/plan" 
              className="bg-gradient-to-b from-zomato to-[#c52c38] text-white font-bold px-6 py-2.5 rounded-xl text-sm border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-md shadow-zomato/20"
            >
              Plan Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {todayItems.map((item: any) => {
              const att = userAttendances.find((a: any) => a.mealPlanItemId === item.id);
              const statusColor = item.state === "COMPLETED" ? "bg-green-100 text-green-700" : 
                                item.state === "COOKING" ? "bg-amber-100 text-amber-700" : 
                                "bg-gray-100 text-gray-700";
              return (
                <motion.div whileTap={{ scale: 0.98 }} key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-foreground text-lg">{item.mealType}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">Your Attendance: <span className="font-bold text-foreground">{att?.status || "NOT SET"}</span></p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${statusColor}`}>
                    {item.state}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">Tomorrow</h2>
          <Link href="/plan" className="text-sm font-bold text-zomato">View Plan →</Link>
        </div>
        <div className="bg-zomato-light p-5 rounded-2xl border border-red-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-zomato-dark text-lg">Planning Status</h3>
            <span className="text-[10px] font-bold bg-white text-zomato-dark px-2.5 py-1 rounded-md shadow-sm border border-red-100 uppercase">{tomorrowPlanState}</span>
          </div>
          <p className="text-sm text-zomato-dark/80 mb-5 font-medium leading-relaxed">
            {tomorrowPlanState === "NO_PLAN" ? "No meals proposed yet." :
             tomorrowPlanState === "PROPOSING" ? "Meals are being proposed and voted on." :
             "The plan is locked in for the cook."}
          </p>
          <Link href="/plan" className="block text-center w-full bg-gradient-to-b from-zomato to-[#c52c38] text-white py-3.5 rounded-xl font-bold border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-md shadow-zomato/20">
            Manage Attendance & Votes
          </Link>
        </div>
      </section>
    </div>
  );
}
