"use client";

import { useState } from "react";
import { finalizeTomorrow } from "@/lib/actions/finalize";
import { resetDatabase } from "@/lib/actions/reset";
import { setupScenario } from "@/lib/actions/dev-scenarios";
import { Wrench } from "lucide-react";

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await finalizeTomorrow();
      alert("Tomorrow finalized!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to wipe all transaction data?")) return;
    setResetting(true);
    try {
      await resetDatabase();
      alert("Database reset successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setResetting(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isOpen && (
        <div className="mb-2 flex w-52 flex-col gap-2 rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground-muted">Developer tools</p>
          <button 
            onClick={handleFinalize}
            disabled={loading || resetting}
            className="w-full rounded-xl bg-surface-muted py-2 text-xs font-bold text-foreground transition hover:bg-border"
          >
            {loading ? "..." : "Finalize Tomorrow"}
          </button>
          <button 
            onClick={handleReset}
            disabled={loading || resetting}
            className="mt-1 w-full rounded-xl bg-red-50 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            {resetting ? "..." : "Reset Database"}
          </button>
          <div className="flex gap-1 mt-1">
            <button onClick={() => setupScenario("A").then(() => alert("Scenario A ready!"))} className="text-[10px] bg-blue-100 text-blue-700 py-1 flex-1 rounded-md">Scen A</button>
            <button onClick={() => setupScenario("B").then(() => alert("Scenario B ready!"))} className="text-[10px] bg-blue-100 text-blue-700 py-1 flex-1 rounded-md">Scen B</button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-white shadow-[0_8px_25px_rgba(0,0,0,0.16)]"
      >
        <Wrench className="h-5 w-5" />
      </button>
    </div>
  );
}
