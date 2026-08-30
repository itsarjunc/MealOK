"use server";

import { SOUTH_INDIAN_RECIPES } from "../constants/south-indian-recipes";

export interface MealDBResult {
  id?: string;
  name: string;
  image: string;
  instructions: string;
  category: string;
  area: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isForkify?: boolean;
}

export async function searchMealDB(query: string): Promise<MealDBResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  
  // 1. Search local South Indian database
  const localMatches: MealDBResult[] = SOUTH_INDIAN_RECIPES.filter(
    r => r.name.toLowerCase().includes(q) || r.instructions.toLowerCase().includes(q)
  ).map(r => ({
    name: r.name,
    image: r.image,
    instructions: r.instructions,
    category: r.category,
    area: r.area,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat
  }));

  // 2. Search Forkify API (keyless, free)
  let apiMatches: MealDBResult[] = [];
  try {
    const res = await fetch(
      `https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.data?.recipes) {
        apiMatches = data.data.recipes.map((recipe: any) => ({
          id: recipe.id,
          name: recipe.title || "",
          image: recipe.image_url || "",
          instructions: "", // Detail fetched on click
          category: "Recipe",
          area: recipe.publisher || "Online",
          isForkify: true
        }));
      }
    }
  } catch (err) {
    console.error("Forkify API fetch error:", err);
  }

  // 3. Merge, avoiding duplicates by name
  const allResults = [...localMatches];
  for (const apiMeal of apiMatches) {
    const exists = allResults.some(
      r => r.name.toLowerCase() === apiMeal.name.toLowerCase()
    );
    if (!exists) {
      allResults.push(apiMeal);
    }
  }

  return allResults;
}

export async function getForkifyRecipeDetails(id: string): Promise<{ instructions: string } | null> {
  try {
    const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`);
    if (!res.ok) return null;

    const data = await res.json();
    const recipe = data.data?.recipe;
    if (!recipe) return null;

    // Convert ingredients list to formatted instructions/description
    const ingredientsList = recipe.ingredients
      .map((ing: any) => {
        const qty = ing.quantity ? `${ing.quantity} ` : "";
        const unit = ing.unit ? `${ing.unit} ` : "";
        return `- ${qty}${unit}${ing.description}`;
      })
      .join("\n");

    const instructions = `Source: ${recipe.source_url || ""}\n\nIngredients:\n${ingredientsList}`;
    return { instructions };
  } catch (err) {
    console.error("Forkify detail fetch error:", err);
    return null;
  }
}
