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
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 p-4 rounded-lg shadow-lg mb-2 w-48 flex flex-col gap-2">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Dev Tools</p>
          <button 
            onClick={handleFinalize}
            disabled={loading || resetting}
            className="text-xs bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 w-full font-medium dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
          >
            {loading ? "..." : "Finalize Tomorrow"}
          </button>
          <button 
            onClick={handleReset}
            disabled={loading || resetting}
            className="text-xs bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 w-full font-medium dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 mt-1"
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
        className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 dark:shadow-none"
      >
        <Wrench className="h-5 w-5" />
      </button>
    </div>
  );
}
