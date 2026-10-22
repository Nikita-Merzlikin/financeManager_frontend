import { apiRequest } from "@/lib/api/client";
import type {
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from "@/lib/types";

export function listTransactions(from: string, to: string) {
  const qs = new URLSearchParams({ from, to });
  return apiRequest<Transaction[]>(`/transactions?${qs}`);
}

export function createTransaction(dto: CreateTransactionDto) {
  return apiRequest<Transaction>("/transactions", { method: "POST", body: dto });
}

export function updateTransaction(id: string, dto: UpdateTransactionDto) {
  return apiRequest<Transaction>(`/transactions/${id}`, {
    method: "PATCH",
    body: dto,
  });
}

export function deleteTransaction(id: string) {
  return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}
