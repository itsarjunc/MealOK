"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

export function MobileBrandBar() {
  const pathname = usePathname();

  if (pathname === "/home" || pathname.startsWith("/home/")) return null;

  return (
    <div className="bg-surface px-4 pb-4 pt-5 md:hidden">
      <Logo className="h-8 w-auto" />
    </div>
  );
}
