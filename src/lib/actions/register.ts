"use server";

import { db } from "@/db";
import { households, users } from "@/db/schema";
import { hash } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function registerUser(input: { name: string; email: string; password: string }) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid registration details.");

  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email));
  if (existingUser) throw new Error("An account with this email already exists.");

  const [household] = await db.select({ id: households.id }).from(households).limit(1);
  if (!household) throw new Error("Registration is not available until a household is configured.");

  const passwordHash = await hash(parsed.data.password, 10);
  await db.insert(users).values({
    householdId: household.id,
    role: "RESIDENT",
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    defaultPortion: 1,
    isActive: true,
  });
}
