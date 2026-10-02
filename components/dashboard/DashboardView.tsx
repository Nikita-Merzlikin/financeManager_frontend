"use client";

import { useEffect, useState } from "react";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DailyChart } from "@/components/dashboard/DailyChart";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { getDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { fromInputDate, toInputDate } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

type Range = { from: string; to: string };

export function DashboardView() {
  const { logout } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Range>({ from: "", to: "" });
  const [applied, setApplied] = useState<Range | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const query =
          applied?.from && applied?.to
            ? {
                from: fromInputDate(applied.from),
                to: fromInputDate(applied.to, true),
              }
            : {};
        const dashboard = await getDashboard(query);
        if (cancelled) return;
        setData(dashboard);
        setDraft({
          from: toInputDate(dashboard.period.from),
          to: toInputDate(dashboard.period.to),
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load dashboard",
        );
        if (err instanceof ApiError && err.status === 401) {
          await logout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [applied, logout]);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="brand-mark">Ledgerly</p>
          <h1>Dashboard</h1>
          {data ? (
            <p className="period-hint">
              {toInputDate(data.period.from)} → {toInputDate(data.period.to)}
            </p>
          ) : null}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
          Log out
        </button>
      </header>

      <PeriodFilter
        from={draft.from}
        to={draft.to}
        onChange={setDraft}
        onApply={() => {
          setLoading(true);
          setApplied({ ...draft });
        }}
      />

      {loading ? <p className="status-line">Loading dashboard…</p> : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {data && !loading ? (
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
