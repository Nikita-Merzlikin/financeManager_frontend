export const queryKeys = {
  dashboard: (from?: string, to?: string) => ["dashboard", from ?? "", to ?? ""] as const,
  accounts: ["accounts"] as const,
  transactions: (from: string, to: string) => ["transactions", from, to] as const,
  categories: ["categories"] as const,
  banks: ["banks"] as const,
  plan: ["plan", "active"] as const,
  planCalendar: ["plan", "calendar"] as const,
  planForecast: ["plan", "forecast"] as const,
  profile: ["profile"] as const,
};
