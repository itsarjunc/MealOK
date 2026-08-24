"use client";

import { useState, useEffect } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { motion, AnimatePresence } from "framer-motion";

export function MealsClient({ initialRecipes }: { initialRecipes: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (showAddForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddForm]);
  const [name, setName] = useState("");
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [instructions, setInstructions] = useState("");

  const toggleMealType = (type: string) => {
    if (mealTypes.includes(type)) {
      setMealTypes(mealTypes.filter((t) => t !== type));
    } else {
      setMealTypes([...mealTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || mealTypes.length === 0) {
      alert("Name and at least one meal type are required.");
      return;
    }
    setIsPending(true);
    try {
      await createRecipe({
        name,
        mealTypes,
        calories: calories ? parseInt(calories) : 0,
        protein: protein ? parseInt(protein) : 0,
        carbs: carbs ? parseInt(carbs) : 0,
        fat: fat ? parseInt(fat) : 0,
        instructions,
      });
      setName("");
      setMealTypes([]);
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setInstructions("");
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to create recipe");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Add Meal Header Trigger */}
      <div className="p-4 bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 flex justify-between items-center">
        <span className="text-sm font-extrabold text-foreground-muted">{initialRecipes.length} recipes available</span>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-b from-zomato to-[#c52c38] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border-b-2 border-[#9c1822] active:translate-y-[1px] active:border-b transition-all shadow-md shadow-zomato/20"
        >
          + Add New Meal
        </button>
      </div>

      {/* Modal/Form Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center md:items-center p-0 md:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPending && setShowAddForm(false)}
              className="absolute inset-0"
            />
            {/* Form Container */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative bg-surface rounded-t-[2rem] md:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col pb-safe shadow-2xl z-10"
            >
              <div className="w-12 h-1.5 bg-surface-muted rounded-full mx-auto mb-6 md:hidden" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Add New Meal</h2>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-foreground-muted hover:text-foreground font-bold text-sm"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Meal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eggs + Toast"
                    className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Meal Types</label>
                  <div className="flex gap-2">
                    {["BREAKFAST", "LUNCH", "DINNER"].map((type) => {
                      const isSelected = mealTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleMealType(type)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected 
                              ? "bg-zomato text-white border-zomato" 
                              : "bg-surface-muted text-foreground-muted border-border"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Calories (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Instructions / Description</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Describe how to prepare this meal..."
                    rows={3}
                    className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-b from-zomato to-[#c52c38] text-white py-3.5 rounded-xl font-bold border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-lg shadow-zomato/30 disabled:opacity-50"
                >
                  {isPending ? "Adding..." : "Add Meal"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe List */}
      <div className="flex flex-col gap-4">
        {initialRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5">
            <h2 className="text-xl font-extrabold text-foreground">{recipe.name}</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              {recipe.mealTypes.map((t: string) => (
                <span key={t} className="text-[10px] font-bold bg-surface-muted text-foreground border border-border px-2.5 py-1 rounded-md">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              <div className="bg-surface-muted p-2 rounded-xl border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-bold mb-1">Cals</p>
                <p className="font-extrabold text-foreground">{recipe.calories || 0}</p>
              </div>
              <div className="bg-surface-muted p-2 rounded-xl border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-bold mb-1">Pro</p>
                <p className="font-extrabold text-foreground">{recipe.protein || 0}g</p>
              </div>
              <div className="bg-surface-muted p-2 rounded-xl border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-bold mb-1">Carb</p>
                <p className="font-extrabold text-foreground">{recipe.carbs || 0}g</p>
              </div>
              <div className="bg-surface-muted p-2 rounded-xl border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-bold mb-1">Fat</p>
                <p className="font-extrabold text-foreground">{recipe.fat || 0}g</p>
              </div>
            </div>
            {recipe.instructions && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-sm text-foreground font-extrabold mb-1">Instructions</p>
                <p className="text-sm text-foreground-muted font-medium">{recipe.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
