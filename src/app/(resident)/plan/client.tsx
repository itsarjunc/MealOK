"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { proposeMeal } from "@/lib/actions/propose";
import { castVote } from "@/lib/actions/vote";
import { setAttendance } from "@/lib/actions/attendance";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function PlanClient({ slots, recipes, planStatus, dateStr }: any) {
  const [proposeSlot, setProposeSlot] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (proposeSlot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [proposeSlot]);

  const handlePropose = async (recipeId: number) => {
    if (!proposeSlot || isPending) return;
    setIsPending(true);
    try {
      await proposeMeal(recipeId, proposeSlot, dateStr);
      setProposeSlot(null);
    } catch (e: any) {
      alert(e.message);
    }
    setIsPending(false);
  };

  const handleVote = async (itemId: number, vote: "APPROVED" | "REJECTED") => {
    if (isPending) return;
    setIsPending(true);
    try {
      await castVote(itemId, vote);
    } catch (e: any) {
      alert(e.message);
    }
    setIsPending(false);
  };

  const handleAttendance = async (itemId: number, status: "EATING" | "NOT_EATING" | "MAYBE") => {
    if (isPending) return;
    setIsPending(true);
    try {
      await setAttendance(itemId, status);
    } catch (e: any) {
      alert(e.message);
    }
    setIsPending(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {slots.map((slot: any) => (
        <div key={slot.mealType} className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 overflow-hidden pb-6">
          <div className="bg-surface-muted px-4 py-3 border-b border-border flex justify-between items-center">
            <h2 className="font-extrabold text-foreground tracking-tight text-lg">{slot.mealType}</h2>
            {slot.state !== "EMPTY" && (
              <span className="text-[10px] font-bold px-2.5 py-1 bg-surface text-foreground rounded-md shadow-sm border border-border uppercase tracking-wide">
                {slot.state}
              </span>
            )}
          </div>
          
          <div className="p-5">
            {slot.state === "EMPTY" ? (
              <div className="text-center py-8">
                <p className="text-foreground-muted text-sm mb-4 font-medium">No meal proposed yet.</p>
                <button 
                  onClick={() => setProposeSlot(slot.mealType)}
                  className="bg-gradient-to-b from-red-50 to-red-100/60 text-zomato font-bold px-6 py-2.5 rounded-xl text-sm border-b-2 border-red-200 active:translate-y-[1px] active:border-b transition-all"
                >
                  Propose a Meal
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{slot.recipe?.name}</h3>
                  <div className="flex gap-4 mt-1.5 text-xs text-foreground-muted font-medium">
                    <span>{slot.recipe?.calories} kcal</span>
                    <span>{slot.recipe?.protein}g Protein</span>
                  </div>
                </div>

                {/* Voting Section */}
                {slot.state === "VOTING" && (
                  <div className="bg-surface-muted p-4 rounded-2xl border border-border">
                    <p className="text-xs font-bold text-foreground mb-3 text-center uppercase tracking-widest">Vote Required</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleVote(slot.id, "APPROVED")}
                        disabled={isPending}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${slot.userVote === "APPROVED" ? "bg-gradient-to-b from-green-500 to-green-600 border-b-4 border-green-700 text-white translate-y-[2px] border-b-2" : "bg-gradient-to-b from-green-50 to-green-100/80 text-green-700 border-b-4 border-green-200 active:translate-y-[2px] active:border-b-2"} ${isPending ? "opacity-50" : ""}`}
                      >
                        <ThumbsUp className="h-4 w-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleVote(slot.id, "REJECTED")}
                        disabled={isPending}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${slot.userVote === "REJECTED" ? "bg-gradient-to-b from-red-500 to-red-600 border-b-4 border-red-700 text-white translate-y-[2px] border-b-2" : "bg-gradient-to-b from-red-50 to-red-100/80 text-red-700 border-b-4 border-red-200 active:translate-y-[2px] active:border-b-2"} ${isPending ? "opacity-50" : ""}`}
                      >
                        <ThumbsDown className="h-4 w-4" /> Reject
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-foreground-muted mt-3 font-medium uppercase tracking-wide">{slot.approveCount} approvals so far</p>
                  </div>
                )}

                {/* Attendance Section */}
                {(slot.state === "APPROVED" || slot.state === "FINALIZED") && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-extrabold text-foreground">My Attendance</h4>
                      <span className="text-xs font-medium text-foreground-muted bg-surface-muted px-2.5 py-1 rounded-md">{slot.eatingCount} people eating</span>
                    </div>
                    <div className="flex bg-surface-muted rounded-xl p-1.5 border border-border">
                      {["EATING", "NOT_EATING", "MAYBE"].map((status) => (
                        <button
                          key={status}
                          disabled={slot.state === "FINALIZED" || isPending}
                          onClick={() => handleAttendance(slot.id, status as any)}
                          className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${slot.userAttendance === status ? "bg-surface shadow-[0_2px_8px_rgb(0,0,0,0.08)] text-zomato" : "text-foreground-muted hover:text-foreground"} ${(slot.state === "FINALIZED" || isPending) ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                          {status.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                    {slot.state === "FINALIZED" && (
                      <p className="text-[10px] font-bold text-foreground-muted mt-2 text-center uppercase tracking-widest">Attendance is locked.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Propose Bottom Sheet */}
      <AnimatePresence>
        {proposeSlot && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setProposeSlot(null)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative bg-surface rounded-t-[2rem] p-6 h-[75vh] flex flex-col pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-surface-muted rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-extrabold mb-6 text-foreground tracking-tight">Propose {proposeSlot}</h2>
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {recipes.filter((r: any) => r.mealTypes.includes(proposeSlot)).map((recipe: any) => (
                  <div key={recipe.id} className="border border-border bg-surface shadow-sm p-5 rounded-2xl flex justify-between items-center transition-all hover:border-border hover:shadow-md">
                    <div>
                      <h3 className="font-extrabold text-foreground text-lg mb-0.5">{recipe.name}</h3>
                      <p className="text-xs text-foreground-muted font-medium">{recipe.calories} kcal • {recipe.protein}g protein</p>
                    </div>
                    <button 
                      onClick={() => handlePropose(recipe.id)}
                      disabled={isPending}
                      className="bg-gradient-to-b from-red-50 to-red-100/60 text-zomato px-5 py-2.5 rounded-xl text-sm font-bold border-b-2 border-red-200 active:translate-y-[1px] active:border-b transition-all"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
