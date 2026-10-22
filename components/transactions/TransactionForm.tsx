"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import * as accountsApi from "@/lib/api/accounts";
import * as categoriesApi from "@/lib/api/categories";
import * as txApi from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { defaultRangeIso, fromInputDate, toInputDate } from "@/lib/dates";
import { queryKeys } from "@/lib/query/keys";
import type { CreateTransactionDto, Transaction, TxType } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  transactionId?: string;
  initial?: Transaction | null;
};

function buildInitial(initial?: Transaction | null): {
  form: CreateTransactionDto;
  date: string;
} {
  if (initial) {
    return {
      form: {
        accountId: initial.accountId,
        type: initial.type,
        amount: initial.amount,
        currency:
          (initial.currency as CreateTransactionDto["currency"]) || "UAH",
        categoryId: initial.categoryId ?? "",
        description: initial.description ?? "",
        occurredAt: initial.occurredAt,
      },
      date: toInputDate(initial.occurredAt),
    };
  }
  return {
    form: {
      accountId: "",
      type: "expense",
      amount: 0,
      currency: "UAH",
      categoryId: "",
      description: "",
      occurredAt: new Date().toISOString(),
    },
    date: toInputDate(new Date().toISOString()),
  };
}

export function TransactionForm({ mode, transactionId, initial }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const seed = buildInitial(initial);
  const [form, setForm] = useState<CreateTransactionDto>(seed.form);
  const [date, setDate] = useState(seed.date);
  const [error, setError] = useState<string | null>(null);

  const accounts = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.listAccounts,
  });
  const categories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.listCategories,
  });

  const accountId =
    form.accountId || accounts.data?.[0]?.id || "";

  const filteredCategories = useMemo(
    () => (categories.data ?? []).filter((c) => c.type === form.type),
    [categories.data, form.type],
  );

  async function invalidateFinance() {
    await qc.invalidateQueries({ queryKey: ["transactions"] });
    await qc.invalidateQueries({ queryKey: ["dashboard"] });
    await qc.invalidateQueries({ queryKey: queryKeys.accounts });
  }

  const create = useMutation({
    mutationFn: txApi.createTransaction,
    onSuccess: async () => {
      await invalidateFinance();
      router.replace("/transactions/");
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Create failed"),
  });

  const update = useMutation({
    mutationFn: (dto: CreateTransactionDto) =>
      txApi.updateTransaction(transactionId!, {
        type: dto.type,
        amount: dto.amount,
        categoryId: dto.categoryId || null,
        description: dto.description,
        occurredAt: dto.occurredAt,
      }),
    onSuccess: async () => {
      await invalidateFinance();
      router.replace("/transactions/");
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Update failed"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CreateTransactionDto = {
      ...form,
      accountId,
      amount: Number(form.amount),
      categoryId: form.categoryId || undefined,
      description: form.description?.trim() || undefined,
      occurredAt: fromInputDate(date) || new Date().toISOString(),
    };
    if (!payload.accountId) {
      setError("Select an account");
      return;
    }
    if (mode === "create") create.mutate(payload);
    else update.mutate(payload);
  }

  const pending = create.isPending || update.isPending;

  return (
    <form className="stack-form panel" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="tx-account">Account</label>
        <select
          id="tx-account"
          required
          value={accountId}
          disabled={mode === "edit"}
          onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
        >
          <option value="" disabled>
            Select account
          </option>
          {(accounts.data ?? []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="tx-type">Type</label>
          <select
            id="tx-type"
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as TxType,
                categoryId: "",
              }))
            }
          >
            <option value="expense">expense</option>
            <option value="income">income</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-amount">Amount</label>
          <input
            id="tx-amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: Number(e.target.value) }))
            }
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="tx-category">Category</label>
        <select
          id="tx-category"
          value={form.categoryId ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">None</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="tx-desc">Description</label>
        <input
          id="tx-desc"
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="field">
        <label htmlFor="tx-date">Date</label>
        <input
          id="tx-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : mode === "create" ? "Create" : "Save"}
      </button>
      <p className="period-hint">
        Tip: default list range is ~{toInputDate(defaultRangeIso().from)} → today.
      </p>
    </form>
  );
}
