import { apiRequest } from "@/lib/api/client";
import type { Account, CreateAccountDto, UpdateAccountDto } from "@/lib/types";

export function listAccounts() {
  return apiRequest<Account[]>("/accounts");
}

export function createAccount(dto: CreateAccountDto) {
  return apiRequest<Account>("/accounts", { method: "POST", body: dto });
}

export function updateAccount(id: string, dto: UpdateAccountDto) {
  return apiRequest<Account>(`/accounts/${id}`, { method: "PATCH", body: dto });
}

export function deleteAccount(id: string) {
  return apiRequest<void>(`/accounts/${id}`, { method: "DELETE" });
}
