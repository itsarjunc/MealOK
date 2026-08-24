import 'dotenv/config';
import { db } from '../src/db';
import { households, users, recipes, ingredients, recipeIngredients, householdSettings } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt-ts';

async function seed() {
  console.log('Seeding development data...');
  
  // Clear DB
  await db.delete(recipeIngredients);
  await db.delete(ingredients);
  await db.delete(recipes);
  await db.delete(users);
  await db.delete(households);
  
  // 1. Household
  const [household] = await db.insert(households).values({
    name: 'Mealok Test House',
    approvalThreshold: 3,
  }).returning();
  
  console.log(`Created household: ${household.name} (${household.id})`);

  // 2. Users
  const passwordHash = await hash('password', 10);
  
  const seedUsers = [
    { name: 'Arjun', email: 'arjun@mealok.local', role: 'RESIDENT', householdId: household.id, passwordHash },
    { name: 'Resident 2', email: 'r2@mealok.local', role: 'RESIDENT', householdId: household.id, passwordHash },
    { name: 'Resident 3', email: 'r3@mealok.local', role: 'RESIDENT', householdId: household.id, passwordHash },
    { name: 'Resident 4', email: 'r4@mealok.local', role: 'RESIDENT', householdId: household.id, passwordHash },
    { name: 'Test Cook', email: 'cook@mealok.local', role: 'COOK', householdId: household.id, passwordHash },
  ];
  
  await db.insert(users).values(seedUsers);
  console.log(`Created ${seedUsers.length} users`);

  // 3. Ingredients
  const ingData = [
    { name: 'Eggs', defaultUnit: 'piece', householdId: household.id },
    { name: 'Toast', defaultUnit: 'slice', householdId: household.id },
    { name: 'Oats', defaultUnit: 'g', householdId: household.id },
    { name: 'Banana', defaultUnit: 'piece', householdId: household.id },
    { name: 'Dosa Batter', defaultUnit: 'g', householdId: household.id },
    { name: 'Chicken', defaultUnit: 'g', householdId: household.id },
    { name: 'Rice', defaultUnit: 'g', householdId: household.id },
    { name: 'Dal', defaultUnit: 'g', householdId: household.id },
    { name: 'Mixed Vegetables', defaultUnit: 'g', householdId: household.id },
    { name: 'Chapati', defaultUnit: 'piece', householdId: household.id },
  ];
  
  const createdIngredients = await db.insert(ingredients).values(ingData).returning();
  const getIng = (name: string) => createdIngredients.find(i => i.name === name)!.id;

  // 4. Recipes & Recipe Ingredients
  const recipeData = [
    {
      name: 'Eggs + Toast',
      mealTypes: ['BREAKFAST'],
      calories: 320, protein: 18, carbs: 24, fat: 16,
      baseServings: 1, instructions: 'Scramble eggs. Toast bread.',
      householdId: household.id,
      ings: [{ i: 'Eggs', q: 2, u: 'piece' }, { i: 'Toast', q: 2, u: 'slice' }]
    },
    {
      name: 'Oats + Banana',
      mealTypes: ['BREAKFAST'],
      calories: 350, protein: 10, carbs: 60, fat: 5,
      baseServings: 1, instructions: 'Boil oats with milk. Slice banana.',
      householdId: household.id,
      ings: [{ i: 'Oats', q: 50, u: 'g' }, { i: 'Banana', q: 1, u: 'piece' }]
    },
    {
      name: 'Dosa + Eggs',
      mealTypes: ['BREAKFAST'],
      calories: 400, protein: 20, carbs: 45, fat: 12,
      baseServings: 1, instructions: 'Make dosa. Fry eggs.',
      householdId: household.id,
      ings: [{ i: 'Dosa Batter', q: 150, u: 'g' }, { i: 'Eggs', q: 2, u: 'piece' }]
    },
    {
      name: 'Chicken Curry + Rice',
      mealTypes: ['LUNCH', 'DINNER'],
      calories: 620, protein: 48, carbs: 55, fat: 22,
      baseServings: 1, instructions: 'Cook chicken curry. Boil rice.',
      householdId: household.id,
      ings: [{ i: 'Chicken', q: 250, u: 'g' }, { i: 'Rice', q: 100, u: 'g' }]
    },
    {
      name: 'Dal + Rice + Vegetables',
      mealTypes: ['LUNCH', 'DINNER'],
      calories: 450, protein: 15, carbs: 70, fat: 8,
      baseServings: 1, instructions: 'Cook dal, fry veg, boil rice.',
      householdId: household.id,
      ings: [{ i: 'Dal', q: 80, u: 'g' }, { i: 'Rice', q: 100, u: 'g' }, { i: 'Mixed Vegetables', q: 100, u: 'g' }]
    },
    {
      name: 'Chicken Biryani',
      mealTypes: ['LUNCH', 'DINNER'],
      calories: 700, protein: 40, carbs: 65, fat: 25,
      baseServings: 1, instructions: 'Marinate chicken. Layer with rice and dum.',
      householdId: household.id,
      ings: [{ i: 'Chicken', q: 200, u: 'g' }, { i: 'Rice', q: 120, u: 'g' }]
    },
    {
      name: 'Chapati + Chicken Curry',
      mealTypes: ['DINNER'],
      calories: 550, protein: 45, carbs: 40, fat: 18,
      baseServings: 1, instructions: 'Make chapati. Cook chicken curry.',
      householdId: household.id,
      ings: [{ i: 'Chapati', q: 3, u: 'piece' }, { i: 'Chicken', q: 250, u: 'g' }]
    },
    {
      name: 'Dal + Chapati',
      mealTypes: ['DINNER'],
      calories: 400, protein: 16, carbs: 50, fat: 10,
      baseServings: 1, instructions: 'Cook dal. Make chapati.',
      householdId: household.id,
      ings: [{ i: 'Dal', q: 80, u: 'g' }, { i: 'Chapati', q: 3, u: 'piece' }]
    },
    {
      name: 'Egg Curry + Rice',
      mealTypes: ['LUNCH', 'DINNER'],
      calories: 500, protein: 22, carbs: 55, fat: 18,
      baseServings: 1, instructions: 'Boil eggs. Make curry. Serve with rice.',
      householdId: household.id,
      ings: [{ i: 'Eggs', q: 2, u: 'piece' }, { i: 'Rice', q: 100, u: 'g' }]
    }
  ];
  
  for (const r of recipeData) {
    const { ings, ...rData } = r;
    const [recipe] = await db.insert(recipes).values(rData).returning();
    
    await db.insert(recipeIngredients).values(
      ings.map(i => ({
        recipeId: recipe.id,
        ingredientId: getIng(i.i),
        quantity: i.q,
        unit: i.u
      }))
    );
  }
  
  const eggsToastId = getIng("Eggs"); // Wait, I need recipe ids, not ingredient ids. Let's find recipe ids.
  const breakfastFallback = await db.select().from(recipes).where(eq(recipes.name, 'Eggs + Toast')).then(r => r[0]);
  const lunchFallback = await db.select().from(recipes).where(eq(recipes.name, 'Dal + Rice + Vegetables')).then(r => r[0]);
  const dinnerFallback = await db.select().from(recipes).where(eq(recipes.name, 'Chapati + Egg Curry')).then(r => r[0]);

  await db.insert(householdSettings).values({
    householdId: household.id,
    fallbackBreakfastId: breakfastFallback?.id,
    fallbackLunchId: lunchFallback?.id,
    fallbackDinnerId: dinnerFallback?.id,
  });

  console.log('Seeded household settings and fallbacks!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
