"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DailyChart } from "@/components/dashboard/DailyChart";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { getDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { fromInputDate, toInputDate } from "@/lib/dates";
import { queryKeys } from "@/lib/query/keys";

type Range = { from: string; to: string };

export function DashboardView() {
  const { logout } = useAuth();
  const [draft, setDraft] = useState<Range | null>(null);
  const [applied, setApplied] = useState<Range | null>(null);

  const query = useQuery({
    queryKey: queryKeys.dashboard(applied?.from, applied?.to),
    queryFn: () => {
      const params =
        applied?.from && applied?.to
          ? {
              from: fromInputDate(applied.from),
              to: fromInputDate(applied.to, true),
            }
          : {};
      return getDashboard(params);
    },
  });

  if (query.error instanceof ApiError && query.error.status === 401) {
    void logout();
  }

  const data = query.data;
  const from =
    draft?.from ?? (data ? toInputDate(data.period.from) : "");
  const to = draft?.to ?? (data ? toInputDate(data.period.to) : "");

  return (
    <div className="dashboard-shell">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          {data ? (
            <p className="period-hint">
              {toInputDate(data.period.from)} → {toInputDate(data.period.to)}
            </p>
          ) : null}
        </div>
      </header>

      <PeriodFilter
        from={from}
        to={to}
        onChange={setDraft}
        onApply={() => setApplied({ from, to })}
      />

      {query.isLoading ? <p className="status-line">Loading dashboard…</p> : null}
      {query.error ? (
        <p className="form-error" role="alert">
          {query.error instanceof Error ? query.error.message : "Failed to load"}
        </p>
      ) : null}

      {data && !query.isLoading ? (
        <>
          <SummaryCards
            balance={data.balance}
            income={data.income}
            expenses={data.expenses}
            savings={data.savings}
            net={data.net}
            currency={data.currency}
          />
          <div className="dashboard-grid">
            <DailyChart series={data.dailySeries} />
            <CategoryBreakdown
              categories={data.byCategory}
              currency={data.currency}
            />
            <AccountsList accounts={data.accounts} />
          </div>
        </>
      ) : null}
    </div>
  );
}
