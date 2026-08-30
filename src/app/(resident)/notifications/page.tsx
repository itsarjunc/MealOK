import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, desc, isNull } from "drizzle-orm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = parseInt(session.user.id);
  
  // Get notifications
  const notifs = await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  // Mark all as read (simple MVP behavior)
  if (notifs.some(n => !n.readAt)) {
    await db.update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  return (
    <div className="min-h-screen bg-surface-muted pb-safe">
      <div className="bg-surface px-4 pb-5 pt-8 md:pt-10">
        <Link href="/home" className="text-xs font-extrabold text-foreground-muted hover:text-foreground">← Back home</Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">Notifications</h1>
        <p className="mt-1 text-sm font-medium text-foreground-muted">Updates from your household kitchen.</p>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-24 pt-5">
        {notifs.length === 0 ? (
          <p className="text-foreground-muted text-center py-8 font-medium">No notifications yet.</p>
        ) : (
          notifs.map(n => (
            <Link key={n.id} href={n.route || "#"} className={`block rounded-2xl border p-4 transition-colors ${n.readAt ? 'border-border bg-surface' : 'border-zomato/20 bg-zomato-light'}`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-extrabold ${n.readAt ? 'text-foreground' : 'text-zomato-dark'}`}>{n.title}</h3>
                <span className="text-[10px] font-medium text-foreground-muted whitespace-nowrap ml-2">
                  {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground-muted mt-1">{n.body}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
