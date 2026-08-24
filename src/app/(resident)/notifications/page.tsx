import { auth } from "@/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
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
  if (notifs.some(n => !n.isRead)) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  return (
    <div className="pb-safe min-h-screen bg-surface">
      <div className="bg-surface pt-12 pb-4 px-4 border-b border-border sticky top-0 z-10 flex items-center gap-3">
        <Link href="/home" className="text-zomato font-bold">← Back</Link>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Notifications</h1>
      </div>
      <div className="flex flex-col pb-24 divide-y divide-border">
        {notifs.length === 0 ? (
          <p className="text-foreground-muted text-center py-8 font-medium">No notifications yet.</p>
        ) : (
          notifs.map(n => (
            <Link key={n.id} href={n.route || "#"} className={`block bg-surface p-4 transition-colors ${n.isRead ? '' : 'bg-zomato-light'}`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-extrabold ${n.isRead ? 'text-foreground' : 'text-zomato-dark'}`}>{n.title}</h3>
                <span className="text-[10px] font-medium text-foreground-muted whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
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
