export function formatQuantity(quantity: number, unit: string): string {
  // Convert large grams to kg
  if (unit === "g" && quantity >= 1000) {
    return `${(quantity / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
  }
  
  // Convert large ml to L
  if (unit === "ml" && quantity >= 1000) {
    return `${(quantity / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} L`;
  }
  
  // Format with sensible precision
  return `${quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}
