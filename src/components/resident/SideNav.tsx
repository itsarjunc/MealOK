"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Utensils, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Plan", href: "/plan", icon: Calendar },
  { name: "Meals", href: "/meals", icon: Utensils },
  { name: "History", href: "/history", icon: History },
  { name: "Manage", href: "/manage", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-surface border-r border-border z-50">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-extrabold text-zomato tracking-tight">Mealok</h1>
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
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
