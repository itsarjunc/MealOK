import { auth } from "@/auth";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MealsClient } from "./client";

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const householdId = parseInt(session.user.householdId);
  const allRecipes = await db.select().from(recipes).where(eq(recipes.householdId, householdId));

  return (
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface-muted px-4 pb-6 pt-5 md:pt-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Recipe library</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Household meals</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">Dishes your household can choose from.</p>
      </div>
      <MealsClient initialRecipes={allRecipes} />
    </div>
  );
}
