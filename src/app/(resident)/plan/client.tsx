"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { proposeMeal } from "@/lib/actions/propose";
import { castVote } from "@/lib/actions/vote";
import { setAttendance } from "@/lib/actions/attendance";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

export function PlanClient({ slots, recipes, planStatus, dateStr }: any) {
  const [proposeSlot, setProposeSlot] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (proposeSlot) {
      document.body.style.overflow = "hidden";
      document.body.dataset.modalOpen = "true";
    } else {
      document.body.style.overflow = "";
      delete document.body.dataset.modalOpen;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.modalOpen;
    };
  }, [proposeSlot]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmSelection = async () => {
    if (!proposeSlot || selectedIds.length === 0 || isPending) return;
    setIsPending(true);
    try {
      await proposeMeal(selectedIds, proposeSlot, dateStr);
      setProposeSlot(null);
      setSelectedIds([]);
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
        <div key={slot.mealType} className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
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
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedIds([]);
                    setProposeSlot(slot.mealType);
                  }}
                  className="rounded-xl border border-border bg-surface-muted px-4 py-2 text-xs font-bold text-foreground transition hover:bg-border"
                >
                  Choose Meal
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  {/* Show all dishes in the combo */}
                  {slot.recipes && slot.recipes.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground">
                        {slot.recipes.map((r: any) => r.name).join(" + ")}
                      </h3>
                      <div className="flex gap-4 mt-1.5 text-xs text-foreground-muted font-medium">
                        <span>{slot.recipes.reduce((sum: number, r: any) => sum + (r.calories || 0), 0)} kcal</span>
                        <span>{slot.recipes.reduce((sum: number, r: any) => sum + (r.protein || 0), 0)}g Protein</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground">{slot.recipe?.name}</h3>
                      <div className="flex gap-4 mt-1.5 text-xs text-foreground-muted font-medium">
                        <span>{slot.recipe?.calories} kcal</span>
                        <span>{slot.recipe?.protein}g Protein</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voting Section */}
                {slot.state === "VOTING" && (
                  <div className="rounded-2xl border border-border bg-surface-muted p-4">
                    <p className="text-xs font-bold text-foreground mb-3 text-center uppercase tracking-widest">Vote Required</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleVote(slot.id, "APPROVED")}
                        disabled={isPending}
                        className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${slot.userVote === "APPROVED" ? "border-green-600 bg-green-600 text-white" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"} ${isPending ? "opacity-50" : ""}`}
                      >
                        <ThumbsUp className="h-4 w-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleVote(slot.id, "REJECTED")}
                        disabled={isPending}
                        className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${slot.userVote === "REJECTED" ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"} ${isPending ? "opacity-50" : ""}`}
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

      {/* Choose Meal Bottom Sheet - Multi-Select */}
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
              className="relative bg-surface rounded-t-[2rem] p-6 h-[80vh] flex flex-col pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-surface-muted rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Choose {proposeSlot}</h2>
                <Link
                  href="/meals"
                    className="rounded-xl bg-zomato px-3 py-2 text-[11px] font-bold text-white transition hover:bg-zomato-dark"
                >
                  + Add New
                </Link>
              </div>

              <p className="text-xs text-foreground-muted font-medium mb-3">Select one or more dishes for this meal.</p>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-muted text-foreground placeholder-foreground-muted border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zomato/20 focus:border-zomato"
                />
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3.5 auto-rows-max pb-20">
                {recipes
                  .filter((r: any) => r.mealTypes.includes(proposeSlot))
                  .filter((r: any) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((recipe: any) => {
                    const isSelected = selectedIds.includes(recipe.id);
                    return (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => toggleSelect(recipe.id)}
                        className={`border bg-surface rounded-2xl overflow-hidden flex flex-col justify-between transition-all text-left ${
                          isSelected
                            ? "border-zomato ring-2 ring-zomato/20"
                            : "border-border shadow-sm hover:shadow-md"
                        }`}
                      >
                        <div>
                          <div className="relative aspect-[4/3] bg-surface-muted">
                            {recipe.image ? (
                              <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground-muted bg-border/20 font-bold uppercase tracking-wider">
                                No Image
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 h-6 w-6 bg-zomato rounded-full flex items-center justify-center shadow-md">
                                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-extrabold text-foreground text-sm line-clamp-1 leading-snug">{recipe.name}</h3>
                            <p className="text-[10px] text-foreground-muted font-bold mt-1 uppercase tracking-wide">{recipe.calories} kcal • {recipe.protein}g P</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Floating Confirm Button */}
              {selectedIds.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-surface via-surface to-transparent">
                  <button
                    onClick={handleConfirmSelection}
                    disabled={isPending}
                    className="w-full rounded-xl bg-zomato py-3 text-sm font-bold text-white transition hover:bg-zomato-dark disabled:opacity-50"
                  >
                    {isPending ? "Confirming..." : `Confirm Selection (${selectedIds.length} ${selectedIds.length === 1 ? 'item' : 'items'})`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
