import { pgTable, serial, text, integer, timestamp, varchar, json, real, date, boolean } from "drizzle-orm/pg-core";

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  approvalThreshold: integer("approval_threshold").notNull().default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

export const householdSettings = pgTable("household_settings", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull().unique(),
  planningDeadline: varchar("planning_deadline", { length: 20 }).notNull().default("22:00"),
  planningOpens: varchar("planning_opens", { length: 20 }).notNull().default("18:00"),
  cookReportingTime: varchar("cook_reporting_time", { length: 20 }).notNull().default("07:00"),
  fallbackBreakfastId: integer("fallback_breakfast_id"),
  fallbackLunchId: integer("fallback_lunch_id"),
  fallbackDinnerId: integer("fallback_dinner_id"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("RESIDENT"), // ADMIN, RESIDENT, COOK
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  defaultPortion: real("default_portion").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  mealTypes: json("meal_types"), // ["BREAKFAST", "LUNCH", "DINNER"]
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  baseServings: integer("base_servings").notNull().default(1),
  instructions: text("instructions"),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  name: text("name").notNull(),
  defaultUnit: varchar("default_unit", { length: 20 }).notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").references(() => recipes.id).notNull(),
  ingredientId: integer("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: real("quantity").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("DRAFT"),
});

export const mealPlanItems = pgTable("meal_plan_items", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").references(() => mealPlans.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  mealType: varchar("meal_type", { length: 20 }).notNull(), // BREAKFAST, LUNCH, DINNER
  recipeId: integer("recipe_id").references(() => recipes.id).notNull(),
  recipeIds: json("recipe_ids"), // Array of recipe IDs for multi-item meals e.g. [1, 5, 12]
  state: varchar("state", { length: 20 }).notNull().default("PROPOSING"),
  source: varchar("source", { length: 20 }).notNull().default("APPROVED"), // APPROVED, FALLBACK
  totalServings: real("total_servings"),
  quantityCalculatedAt: timestamp("quantity_calculated_at"),
  calculatedIngredients: json("calculated_ingredients"),
});

export const mealAttendance = pgTable("meal_attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  mealPlanItemId: integer("meal_plan_item_id").references(() => mealPlanItems.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("EATING"), // EATING, NOT_EATING, MAYBE
  portionOverride: real("portion_override"),
});

export const mealVotes = pgTable("meal_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  mealPlanItemId: integer("meal_plan_item_id").references(() => mealPlanItems.id).notNull(),
  vote: varchar("vote", { length: 20 }).notNull(), // APPROVED, REJECTED
});

export const mealChangeRequests = pgTable("meal_change_requests", {
  id: serial("id").primaryKey(),
  mealPlanItemId: integer("meal_plan_item_id").references(() => mealPlanItems.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("REQUESTED"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cookConfirmations = pgTable("cook_confirmations", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").references(() => mealPlans.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  cookId: integer("cook_id").references(() => users.id).notNull(),
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
});

export const dailyNutritionTargets = pgTable("daily_nutrition_targets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
});

export const weeklyTemplates = pgTable("weekly_templates", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id).notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").references(() => households.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  deviceName: varchar("device_name", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at"),
  revokedAt: timestamp("revoked_at"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  householdId: integer("household_id").references(() => households.id).notNull(), // Tenant isolation
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  route: text("route"),
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  sentAt: timestamp("sent_at"),
  failureInfo: text("failure_info"),
});
