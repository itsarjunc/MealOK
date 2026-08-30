import { format } from "date-fns";

export function assertPlanningOpen(dateString: string, now = new Date()) {
  const todayString = format(now, "yyyy-MM-dd");

  if (dateString < todayString || (dateString === todayString && now.getHours() >= 6)) {
    throw new Error("Planning for this day closed at 6:00 AM.");
  }
}
