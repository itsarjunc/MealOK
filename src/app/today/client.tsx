"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, ChevronDown, ChevronUp, Clock3, Flame, Users } from "lucide-react";
import { formatQuantity } from "@/lib/utils/format";

type PublicTodayItem = {
  id: number;
  mealType: string;
  state: string;
  totalServings: number | null;
  recipe: { name: string; instructions?: string | null; image?: string | null; calories?: number | null };
  snapshot: {
    recipes?: Array<{ name: string; instructions?: string | null; image?: string | null; calories?: number | null }>;
  } | null;
  ingredients: Array<{ name: string; quantity: number; unit: string; recipeName?: string }>;
};

const mealOrder = ["BREAKFAST", "LUNCH", "DINNER"];

function formatMealType(mealType: string) {
  return mealType.charAt(0) + mealType.slice(1).toLowerCase();
}

function statusLabel(state: string) {
  return state.charAt(0) + state.slice(1).toLowerCase();
}

export function PublicTodayClient({ items, dateStr }: { items: PublicTodayItem[]; dateStr: string }) {
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const orderedItems = [...items].sort(
    (a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType),
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <header className="border-b border-border px-5 pb-5 pt-5">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-foreground">{dateStr}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">Today&apos;s menu</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="mt-0.5 text-sm font-extrabold text-foreground">{currentTime || "..."}</p>
          </div>
        </div>
      </header>

      {orderedItems.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-2xl">
            <span role="img" aria-label="Thinking">🤔</span>
          </div>
          <h2 className="mt-5 text-xl font-extrabold tracking-tight text-foreground">No menu yet</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-foreground-muted">
            Today&apos;s meals have not been finalized by the household yet. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between border-b border-border py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">The menu</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">What&apos;s cooking</h1>
            </div>
            <div className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground-muted">
              {orderedItems.length} {orderedItems.length === 1 ? "meal" : "meals"}
            </div>
          </div>

          <div>
            {orderedItems.map((item, index) => {
              const isExpanded = expandedSlot === item.mealType;
              const recipes = item.snapshot?.recipes?.length ? item.snapshot.recipes : [item.recipe];
              const imageRecipes = recipes.filter((recipe) => recipe.image);
              const calories = recipes.reduce((sum, recipe) => sum + (recipe.calories || 0), 0);

              return (
                <article key={item.id} className={`py-5 ${index < orderedItems.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground-muted">{formatMealType(item.mealType)}</p>
                        <h2 className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-foreground">
                          {recipes.map((recipe) => recipe.name).join(" + ")}
                        </h2>
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-green-700">
                      <Check className="h-3 w-3" /> {statusLabel(item.state)}
                    </span>
                  </div>

                  {imageRecipes.length > 0 && (
                    <div className={`mt-4 grid gap-2 ${imageRecipes.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {imageRecipes.map((recipe, recipeIndex) => (
                        <div key={`${recipe.name}-${recipeIndex}`} className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-border/30">
                          <img src={recipe.image || ""} alt={recipe.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8">
                            <p className="line-clamp-1 text-xs font-bold text-white">{recipe.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-foreground-muted">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{item.totalServings || 0} portions</span>
                    <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" />{calories} kcal</span>
                  </div>

                  <button
                    onClick={() => setExpandedSlot(isExpanded ? null : item.mealType)}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border border-border px-3.5 py-3 text-left text-xs font-extrabold text-foreground transition-colors hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-foreground-muted" />{isExpanded ? "Hide preparation details" : "View preparation details"}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="mt-4 space-y-5 border-t border-border pt-4">
                          <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground">Ingredients</h3>
                            {item.ingredients.length === 0 ? (
                              <p className="mt-3 text-xs font-medium text-foreground-muted">No ingredients configured.</p>
                            ) : (
                              <ul className="mt-3 space-y-2">
                                {item.ingredients.map((ingredient, ingredientIndex) => (
                                  <li key={`${ingredient.name}-${ingredientIndex}`} className="flex justify-between gap-4 border-b border-border/60 pb-2 text-xs font-medium text-foreground-muted last:border-0 last:pb-0">
                                    <span>{ingredient.name}{ingredient.recipeName ? ` (${ingredient.recipeName})` : ""}</span>
                                    <span className="shrink-0 font-bold text-foreground">{formatQuantity(ingredient.quantity, ingredient.unit)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-foreground">Preparation</h3>
                            <div className="mt-3 space-y-3">
                              {recipes.map((recipe, recipeIndex) => (
                                <div key={`${recipe.name}-${recipeIndex}`} className="rounded-xl bg-surface-muted p-3.5">
                                  {recipes.length > 1 && <p className="mb-1.5 text-xs font-extrabold text-foreground">{recipe.name}</p>}
                                  <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-foreground-muted">{recipe.instructions || "No steps documented."}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
