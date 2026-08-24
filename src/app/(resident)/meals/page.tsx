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
    <div className="pb-safe min-h-screen bg-surface-muted">
      <div className="bg-surface pt-12 pb-4 px-4 border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Household Meals</h1>
      </div>
      <MealsClient initialRecipes={allRecipes} />
    </div>
  );
}
