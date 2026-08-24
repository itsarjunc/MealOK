export function calculateTotalPortions(attendances: any[], allUsers: any[]): number {
  let total = 0;
  for (const att of attendances) {
    if (att.status === "EATING") {
      if (att.portionOverride != null) {
        total += att.portionOverride;
      } else {
        const u = allUsers.find((user: any) => user.id === att.userId);
        total += u?.defaultPortion || 1;
      }
    }
  }
  return total;
}
