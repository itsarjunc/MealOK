"use client";

import { useState } from "react";
import { updateCookStatus } from "@/lib/actions/cook";
import { motion } from "framer-motion";
import { formatQuantity } from "@/lib/utils/format";

export function CookClient({ items, readOnly }: any) {
  const [isPending, setIsPending] = useState(false);

  const handleStatus = async (itemId: number, status: "COOKING" | "COMPLETED") => {
    if (isPending) return;
    setIsPending(true);
    try {
      await updateCookStatus(itemId, status);
    } catch (e: any) {
      alert(e.message);
    }
    setIsPending(false);
  };

  if (items.length === 0) {
    return (
      <div className="mx-4 rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <p className="text-foreground-muted font-medium">No meals finalized for today yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item: any) => (
        <div key={item.id} className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
            <h2 className="font-extrabold text-foreground tracking-tight text-lg">{item.mealType}</h2>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${
              item.state === "COMPLETED" ? "bg-green-50 text-green-700 border-green-100" :
              item.state === "COOKING" ? "bg-red-50 text-zomato border-red-100" :
              "bg-surface text-foreground border-border"
            }`}>
              {item.state}
            </span>
          </div>

          <div className="p-5">
            {/* Show all dish names */}
            <h3 className="text-xl font-extrabold text-foreground mb-1">
              {item.snapshot?.recipes
                ? item.snapshot.recipes.map((r: any) => r.name).join(" + ")
                : item.recipe?.name}
            </h3>
            <p className="text-sm text-foreground-muted mb-5 font-medium">{item.totalServings} Total Servings</p>

            <div className="mb-5 rounded-2xl border border-border bg-surface-muted p-5">
              <h4 className="text-sm font-extrabold text-foreground mb-3">Ingredients Required</h4>
              <ul className="space-y-2.5">
                {item.ingredients.map((ing: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm text-foreground-muted font-medium">
                    <span>{ing.name}{ing.recipeName ? ` (${ing.recipeName})` : ""}</span>
                    <span className="font-bold text-foreground">{formatQuantity(ing.quantity, ing.unit)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-7">
              <h4 className="text-sm font-extrabold text-foreground mb-2">Instructions</h4>
              {item.snapshot?.recipes ? (
                <div className="space-y-3">
                  {item.snapshot.recipes.map((r: any, idx: number) => (
                    <div key={idx}>
                      {item.snapshot.recipes.length > 1 && (
                        <p className="text-xs font-bold text-foreground-muted uppercase tracking-wide mb-1">{r.name}</p>
                      )}
                      <p className="text-sm text-foreground-muted leading-relaxed font-medium">{r.instructions}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted leading-relaxed font-medium">{item.recipe?.instructions}</p>
              )}
            </div>

            {!readOnly && item.state === "FINALIZED" && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatus(item.id, "COOKING")}
                disabled={isPending}
                className="w-full rounded-xl bg-zomato py-3.5 font-bold text-white transition hover:bg-zomato-dark active:scale-[0.99]"
              >
                Start Cooking
              </motion.button>
            )}

            {!readOnly && item.state === "COOKING" && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatus(item.id, "COMPLETED")}
                disabled={isPending}
                className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all active:scale-95 shadow-md shadow-green-500/20"
              >
                Mark as Completed
              </motion.button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
