import { apiRequest } from "@/lib/api/client";
import type {
  BankConnection,
  ConnectMonobankDto,
  ConnectPrivatDto,
} from "@/lib/types";

export function listConnections() {
  return apiRequest<BankConnection[]>("/banks/connections");
}

export function connectMonobank(dto: ConnectMonobankDto) {
  return apiRequest<BankConnection>("/banks/monobank/connect", {
    method: "POST",
    body: dto,
  });
}

export function connectPrivat(dto: ConnectPrivatDto) {
  return apiRequest<BankConnection>("/banks/privat/connect", {
    method: "POST",
    body: dto,
  });
}

export function syncConnection(id: string, days = 30) {
  return apiRequest<BankConnection>(`/banks/connections/${id}/sync`, {
    method: "POST",
    body: { days },
  });
}

export function deleteConnection(id: string) {
  return apiRequest<void>(`/banks/connections/${id}`, { method: "DELETE" });
}
