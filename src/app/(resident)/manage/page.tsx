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
    <div className="pb-safe min-h-screen bg-surface-muted">
      <div className="bg-surface pt-12 pb-4 px-4 border-b border-border sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Manage</h1>
      </div>
      <ManageClient initialName={user?.name || ""} initialReportingTime={reportingTime} />
    </div>
  );
}
