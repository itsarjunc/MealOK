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

export function CookSideNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface border-r border-border z-50">
      <div className="p-6 border-b border-border flex justify-center select-none">
        <img src="/branding/Vector.svg" alt="Logo" className="h-16 w-auto" />
      </div>
      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 font-medium transition-colors rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-zomato",
                isActive 
                  ? "bg-zomato-light text-zomato font-bold shadow-sm" 
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-bold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
