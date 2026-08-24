import { CookNav } from "@/components/cook/CookNav";
import { CookSideNav } from "@/components/cook/CookSideNav";
import { ReactNode } from "react";

export default function CookLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-muted pb-20 md:pb-0 md:flex-row">
      <CookSideNav />
      <main className="flex-1 w-full max-w-md mx-auto p-0 md:p-4 md:ml-64 pb-20 md:pb-8">
        {children}
      </main>
      <CookNav />
    </div>
  );
}
