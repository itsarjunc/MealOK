"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Today", href: "/cook/today", icon: CalendarClock },
  { name: "History", href: "/cook/history", icon: History },
  { name: "Profile", href: "/cook/profile", icon: User },
];

export function CookNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 border-t border-border bg-surface pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.06)] md:hidden">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zomato focus-visible:ring-inset",
              isActive ? "text-zomato font-bold" : "text-foreground-muted hover:text-foreground font-medium"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
