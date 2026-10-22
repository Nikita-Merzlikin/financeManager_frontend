"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import * as txApi from "@/lib/api/transactions";
import { defaultRangeIso, fromInputDate, toInputDate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";

export function TransactionsPage() {
  const qc = useQueryClient();
  const initial = useMemo(() => defaultRangeIso(), []);
  const [draft, setDraft] = useState({
    from: toInputDate(initial.from),
    to: toInputDate(initial.to),
  });
  const [applied, setApplied] = useState({
    from: initial.from,
    to: initial.to,
  });

  const list = useQuery({
    queryKey: queryKeys.transactions(applied.from, applied.to),
    queryFn: () => txApi.listTransactions(applied.from, applied.to),
  });

  const remove = useMutation({
    mutationFn: txApi.deleteTransaction,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="period-hint">Amounts in major units.</p>
        </div>
        <Link className="btn btn-primary" href="/transactions/new/">
          Add
        </Link>
      </header>

      <PeriodFilter
        from={draft.from}
        to={draft.to}
        onChange={setDraft}
        onApply={() =>
          setApplied({
            from: fromInputDate(draft.from),
            to: fromInputDate(draft.to, true),
          })
        }
      />

      <section className="panel">
        {list.isLoading ? <p className="status-line">Loading…</p> : null}
        {list.error ? (
          <p className="form-error">
            {list.error instanceof Error ? list.error.message : "Failed"}
          </p>
        ) : null}
        <ul className="tx-list">
          {(list.data ?? []).map((tx) => (
            <li key={tx.id}>
              <div>
                <p className="cat-name">
                  {tx.description || tx.type}
                  <span className="account-meta"> · {tx.source}</span>
                </p>
                <p className="account-meta">
                  {toInputDate(tx.occurredAt)} · {tx.type}
                </p>
              </div>
              <div className="row-actions">
                <p className={`cat-total ${tx.type === "income" ? "pos" : "neg"}`}>
                  {formatMoney(tx.amount, tx.currency)}
                </p>
                <Link className="btn btn-ghost" href={`/transactions/edit/?id=${tx.id}`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm("Delete transaction?")) remove.mutate(tx.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.data?.length === 0 ? <p className="empty">No transactions in range.</p> : null}
      </section>
    </div>
  );
}
