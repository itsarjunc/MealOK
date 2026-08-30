"use client";

import { useState } from "react";
import { updateProfile, updateReportingTime } from "@/lib/actions/manage";
import { logout } from "@/lib/actions/auth";
import { LogOut, UserRound, Utensils } from "lucide-react";

export function ManageClient({ 
  initialName, 
  initialReportingTime 
}: { 
  initialName: string; 
  initialReportingTime: string;
}) {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [reportingTime, setReportingTime] = useState(initialReportingTime);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [isTimePending, setIsTimePending] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfilePending(true);
    try {
      await updateProfile({ name, password: password || undefined });
      setPassword("");
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsProfilePending(false);
    }
  };

  const handleTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTimePending(true);
    try {
      await updateReportingTime(reportingTime);
      alert("Cook reporting time updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update reporting time");
    } finally {
      setIsTimePending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-24">
      {/* Profile form section */}
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 rounded-[2rem] border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted"><UserRound className="h-5 w-5" /></div>
          <div><h2 className="text-base font-extrabold text-foreground">My account</h2><p className="text-xs font-medium text-foreground-muted">Your name and sign-in details.</p></div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Display Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">New Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isProfilePending}
          className="w-full rounded-xl bg-zomato py-3 text-xs font-bold text-white transition hover:bg-zomato-dark disabled:opacity-50"
        >
          {isProfilePending ? "Saving..." : "Save Account Settings"}
        </button>
      </form>

      {/* Reporting time section */}
      <form onSubmit={handleTimeSubmit} className="flex flex-col gap-4 rounded-[2rem] border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-foreground-muted"><Utensils className="h-5 w-5" /></div>
          <div><h2 className="text-base font-extrabold text-foreground">Kitchen settings</h2><p className="text-xs font-medium text-foreground-muted">When the cook should report in.</p></div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 text-foreground uppercase tracking-wide">Cook Reporting Time</label>
          <input
            type="time"
            required
            value={reportingTime}
            onChange={(e) => setReportingTime(e.target.value)}
            className="w-full border border-border bg-surface-muted text-foreground p-3 rounded-xl focus:border-zomato focus:ring-1 focus:ring-zomato outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isTimePending}
          className="w-full rounded-xl bg-zomato py-3 text-xs font-bold text-white transition hover:bg-zomato-dark disabled:opacity-50"
        >
          {isTimePending ? "Saving..." : "Save Cook Reporting Time"}
        </button>
      </form>

      {/* Logout section */}
      <div className="rounded-[2rem] border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted py-3 text-xs font-bold text-foreground transition hover:bg-border"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </div>
    </div>
  );
}
