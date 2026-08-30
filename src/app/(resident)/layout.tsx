import { BottomNav } from "@/components/resident/BottomNav";
import { SideNav } from "@/components/resident/SideNav";
import { MobileBrandBar } from "@/components/MobileBrandBar";
import { ReactNode } from "react";

export default function ResidentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted pb-16 md:flex-row md:pb-0">
      <SideNav />
      <main className="mx-auto w-full max-w-5xl flex-1 pb-20 md:ml-64 md:px-6 md:pb-8">
        <MobileBrandBar />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
