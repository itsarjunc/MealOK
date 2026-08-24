"use server";

import { db } from "@/db";
import { users, householdSettings } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt-ts";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: { name?: string; password?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  const updates: any = {};

  if (formData.name) {
    updates.name = formData.name;
  }
  if (formData.password) {
    updates.passwordHash = await hash(formData.password, 10);
  }

  if (Object.keys(updates).length > 0) {
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  revalidatePath("/manage");
}

export async function updateReportingTime(time: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const householdId = parseInt(session.user.householdId);

  // Ensure settings record exists
  const [settings] = await db.select().from(householdSettings).where(eq(householdSettings.householdId, householdId));
  if (!settings) {
    await db.insert(householdSettings).values({
      householdId,
      cookReportingTime: time,
    });
  } else {
    await db.update(householdSettings)
      .set({ cookReportingTime: time })
      .where(eq(householdSettings.householdId, householdId));
  }

  revalidatePath("/manage");
}
