import { CookNav } from "@/components/cook/CookNav";
import { CookSideNav } from "@/components/cook/CookSideNav";
import { MobileBrandBar } from "@/components/MobileBrandBar";
import { ReactNode } from "react";

export default function CookLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted pb-20 md:flex-row md:pb-0">
      <CookSideNav />
      <main className="mx-auto w-full max-w-5xl flex-1 pb-20 md:ml-64 md:px-6 md:pb-8">
        <MobileBrandBar />
        {children}
      </main>
      <CookNav />
    </div>
  );
}
