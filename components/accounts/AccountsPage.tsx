"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import * as accountsApi from "@/lib/api/accounts";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import type { AccountType, CreateAccountDto } from "@/lib/types";

const TYPES: AccountType[] = ["cash", "card", "bank", "jar", "fop", "other"];

export function AccountsPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.listAccounts,
  });

  const [form, setForm] = useState<CreateAccountDto>({
    name: "",
    type: "card",
    currency: "UAH",
    balance: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: accountsApi.createAccount,
    onSuccess: async () => {
      setForm({ name: "", type: "card", currency: "UAH", balance: 0 });
      setError(null);
      await qc.invalidateQueries({ queryKey: queryKeys.accounts });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Create failed");
    },
  });

  const remove = useMutation({
    mutationFn: accountsApi.deleteAccount,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.accounts });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate({
      ...form,
      name: form.name.trim(),
      balance: Number(form.balance) || 0,
    });
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>Accounts</h1>
        <p className="period-hint">Manual accounts only can be deleted.</p>
      </header>

      <section className="panel">
        <h2>Add account</h2>
        <form className="stack-form" onSubmit={onSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="acc-name">Name</label>
              <input
                id="acc-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="acc-type">Type</label>
              <select
                id="acc-type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as AccountType }))
                }
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="acc-balance">Balance</label>
              <input
                id="acc-balance"
                type="number"
                step="0.01"
                value={form.balance ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, balance: Number(e.target.value) }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="acc-currency">Currency</label>
              <select
                id="acc-currency"
                value={form.currency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currency: e.target.value as CreateAccountDto["currency"],
                  }))
                }
              >
                <option value="UAH">UAH</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Create"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Your accounts</h2>
        {list.isLoading ? <p className="status-line">Loading…</p> : null}
        {list.error ? (
          <p className="form-error">
            {list.error instanceof Error ? list.error.message : "Failed"}
          </p>
        ) : null}
        <ul className="account-list">
          {(list.data ?? []).map((account) => (
            <li key={account.id}>
              <div>
                <p className="account-name">{account.name}</p>
                <p className="account-meta">
                  {account.type} · {account.source}
                  {!account.isActive ? " · inactive" : ""}
                </p>
              </div>
              <div className="row-actions">
                <p className="account-balance">
                  {formatMoney(account.balance, account.currency)}
                </p>
                {account.source === "manual" ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Delete ${account.name}?`)) {
                        remove.mutate(account.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {list.data?.length === 0 ? <p className="empty">No accounts yet.</p> : null}
      </section>
    </div>
  );
}
