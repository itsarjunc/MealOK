"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Utensils, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Meals", href: "/meals", icon: Utensils },
  { name: "History", href: "/history", icon: History },
  { name: "Manage", href: "/manage", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      setIsModalOpen(document.body.dataset.modalOpen === "true");
    };
    checkModal();

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-modal-open"] });

    return () => observer.disconnect();
  }, []);

  if (isModalOpen) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-surface border-t border-border pb-safe md:hidden">
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
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
