ALTER TABLE "household_settings" ADD COLUMN "cook_reporting_time" varchar(20) DEFAULT '07:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "meal_plan_items" ADD COLUMN "recipe_ids" json;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "image" text;