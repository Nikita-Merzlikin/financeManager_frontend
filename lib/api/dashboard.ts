import { apiRequest } from "@/lib/api/client";
import type { Dashboard } from "@/lib/types";

export type DashboardQuery = {
  from?: string;
  to?: string;
};

export function getDashboard(query: DashboardQuery = {}) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const qs = params.toString();
  return apiRequest<Dashboard>(`/dashboard${qs ? `?${qs}` : ""}`);
}
