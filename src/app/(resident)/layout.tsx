import { BottomNav } from "@/components/resident/BottomNav";
import { SideNav } from "@/components/resident/SideNav";
import { ReactNode } from "react";

export default function ResidentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-muted pb-16 md:pb-0 md:flex-row">
      <SideNav />
      <main className="flex-1 w-full max-w-md mx-auto p-0 md:p-4 md:ml-64 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
