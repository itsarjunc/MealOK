"use client";

import { useState } from "react";
import { updateProfile, updateReportingTime } from "@/lib/actions/manage";
import { logout } from "@/lib/actions/auth";

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
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Profile form section */}
      <form onSubmit={handleProfileSubmit} className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-foreground-muted uppercase tracking-wider mb-1">My Account</h2>
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
          className="w-full bg-gradient-to-b from-zomato to-[#c52c38] text-white text-sm font-bold py-3.5 rounded-xl border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-md shadow-zomato/20 disabled:opacity-50"
        >
          {isProfilePending ? "Saving..." : "Save Account Settings"}
        </button>
      </form>

      {/* Reporting time section */}
      <form onSubmit={handleTimeSubmit} className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-foreground-muted uppercase tracking-wider mb-1">Kitchen & Cook Settings</h2>
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
          className="w-full bg-gradient-to-b from-zomato to-[#c52c38] text-white text-sm font-bold py-3.5 rounded-xl border-b-4 border-[#9c1822] active:translate-y-[2px] active:border-b-2 transition-all shadow-md shadow-zomato/20 disabled:opacity-50"
        >
          {isTimePending ? "Saving..." : "Save Cook Reporting Time"}
        </button>
      </form>

      {/* Logout section */}
      <div className="bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50 p-5">
        <button 
          onClick={() => logout()}
          className="w-full bg-gradient-to-b from-red-50 to-red-100/60 text-zomato font-bold py-3.5 rounded-xl border-b-4 border-red-200 active:translate-y-[2px] active:border-b-2 transition-all"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
