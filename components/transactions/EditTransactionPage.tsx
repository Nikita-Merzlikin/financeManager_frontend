"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import * as txApi from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query/keys";

function yearRange() {
  const to = new Date();
  const from = new Date();
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function EditTransactionPage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const range = yearRange();

  const list = useQuery({
    queryKey: queryKeys.transactions(range.from, range.to),
    queryFn: () => txApi.listTransactions(range.from, range.to),
    enabled: Boolean(id),
  });

  const tx = list.data?.find((t) => t.id === id) ?? null;

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>Edit transaction</h1>
      </header>
      {!id ? <p className="form-error">Missing transaction id.</p> : null}
      {id && list.isLoading ? <p className="status-line">Loading…</p> : null}
      {id && !list.isLoading && !tx ? (
        <p className="form-error">Transaction not found in the last year.</p>
      ) : null}
      {tx ? (
        <TransactionForm
          key={tx.id}
          mode="edit"
          transactionId={tx.id}
          initial={tx}
        />
      ) : null}
    </div>
  );
}
