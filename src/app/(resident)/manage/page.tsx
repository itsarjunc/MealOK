import { auth } from "@/auth";
import { db } from "@/db";
import { users, householdSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ManageClient } from "./client";

export default async function ManagePage() {
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const userId = parseInt(session.user.id);
  const householdId = parseInt(session.user.householdId);

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [settings] = await db.select().from(householdSettings).where(eq(householdSettings.householdId, householdId));

  const reportingTime = settings?.cookReportingTime || "07:00";

  return (
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface px-4 pb-5 pt-8 md:pt-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground-muted">Your preferences</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Manage</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">Keep your account and kitchen settings up to date.</p>
      </div>
      <ManageClient initialName={user?.name || ""} initialReportingTime={reportingTime} />
    </div>
  );
}
