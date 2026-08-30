"use client";

import { usePathname } from "next/navigation";

export function MobileBrandBar() {
  const pathname = usePathname();

  if (pathname === "/home") return null;

  return (
    <div className="bg-surface px-4 pb-4 pt-5 md:hidden">
      <img src="/branding/Vector.svg" alt="MealOK" className="h-8 w-auto" />
    </div>
  );
}
