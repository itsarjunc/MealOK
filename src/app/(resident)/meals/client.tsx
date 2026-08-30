"use client";

import { useState, useEffect, useCallback } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { searchMealDB, getForkifyRecipeDetails, type MealDBResult } from "@/lib/actions/recipe-search";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";

export function MealsClient({ initialRecipes }: { initialRecipes: any[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (showAddForm) {
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
  }, [showAddForm]);

  const [name, setName] = useState("");
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState("");

  // API search state
  const [apiQuery, setApiQuery] = useState("");
  const [apiResults, setApiResults] = useState<MealDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced API search
  useEffect(() => {
    if (apiQuery.trim().length < 2) {
      setApiResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchMealDB(apiQuery);
      setApiResults(results);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [apiQuery]);

  const selectApiResult = async (result: MealDBResult) => {
    setIsPending(true);
    try {
      setName(result.name);
      setImage(result.image);
      setCalories(result.calories ? result.calories.toString() : "");
      setProtein(result.protein ? result.protein.toString() : "");
      setCarbs(result.carbs ? result.carbs.toString() : "");
      setFat(result.fat ? result.fat.toString() : "");

      if (result.isForkify && result.id) {
        const details = await getForkifyRecipeDetails(result.id);
        if (details) {
          setInstructions(details.instructions);
        } else {
          setInstructions("");
        }
      } else {
        setInstructions(result.instructions?.slice(0, 500) || "");
      }
    } catch (e: any) {
      alert("Failed to load recipe details. You can enter instructions manually.");
    } finally {
      setIsPending(false);
      setApiQuery("");
      setApiResults([]);
    }
  };

  const toggleMealType = (type: string) => {
    if (mealTypes.includes(type)) {
      setMealTypes(mealTypes.filter((t) => t !== type));
    } else {
      setMealTypes([...mealTypes, type]);
    }
  };

  const resetForm = () => {
    setName("");
    setMealTypes([]);
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setInstructions("");
    setImage("");
    setApiQuery("");
    setApiResults([]);
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
        image: image || undefined,
      });
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to create recipe");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-24">
      {/* Add Meal Header Trigger */}
      <div className="flex items-center justify-between rounded-[2rem] border border-border bg-surface p-4 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted"><BookOpen className="h-5 w-5" /></div>
          <div><p className="text-sm font-extrabold text-foreground">Your collection</p><p className="text-xs font-medium text-foreground-muted">{initialRecipes.length} {initialRecipes.length === 1 ? "recipe" : "recipes"} available</p></div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-xl bg-zomato px-3 py-2 text-[11px] font-bold text-white transition hover:bg-zomato-dark"
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
              className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-t-[2rem] bg-surface p-6 pb-safe shadow-2xl md:rounded-3xl"
            >
              <div className="w-12 h-1.5 bg-surface-muted rounded-full mx-auto mb-6 md:hidden" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Add New Meal</h2>
                <button type="button" onClick={() => !isPending && setShowAddForm(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted hover:bg-border"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-8">
                {/* API Search */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Search Online Recipes</label>
                  <input
                    type="text"
                    value={apiQuery}
                    onChange={(e) => setApiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    placeholder="Search for a dish (e.g. chicken, curry, bread)..."
                    className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all text-sm"
                  />
                  {isSearching && (
                    <p className="text-[10px] text-foreground-muted mt-1.5 font-bold uppercase tracking-wider animate-pulse">Searching...</p>
                  )}
                  {apiQuery.trim().length >= 2 && !isSearching && apiResults.length === 0 && (
                    <p className="text-[10px] text-foreground-muted mt-1.5 font-medium">No online recipes found for "{apiQuery}". Feel free to type the details manually below.</p>
                  )}
                  {apiResults.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {apiResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectApiResult(result)}
                          className="border border-border bg-surface rounded-xl overflow-hidden text-left transition-all hover:border-zomato/50 hover:shadow-md"
                        >
                          {result.image && (
                            <img src={result.image} alt={result.name} className="w-full h-20 object-cover" />
                          )}
                          <div className="p-2">
                            <p className="text-[11px] font-bold text-foreground line-clamp-1">{result.name}</p>
                            <p className="text-[9px] text-foreground-muted font-medium">{result.area}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Meal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chapati, Chicken Curry, Rice"
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

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={isPending}
                    className="flex-1 rounded-xl border border-border bg-surface-muted py-3 text-xs font-bold text-foreground transition hover:bg-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-zomato py-3 text-xs font-bold text-white transition hover:bg-zomato-dark disabled:opacity-50"
                  >
                    {isPending ? "Adding..." : "Add Meal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe List */}
      {initialRecipes.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border bg-surface px-6 py-16 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="mt-4 text-sm font-bold text-foreground">Your recipe library is empty</p>
          <p className="mt-1 text-xs font-medium text-foreground-muted">Add a meal to start planning menus.</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-3">
        {initialRecipes.map((recipe) => (
          <div key={recipe.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all hover:border-border hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
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
              </div>
              <div className="p-3">
                <h3 className="font-extrabold text-foreground text-sm line-clamp-1 leading-snug">{recipe.name}</h3>
                <p className="text-[10px] text-foreground-muted font-bold mt-1 uppercase tracking-wide">{recipe.calories} kcal • {recipe.protein}g P</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
