"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api/client";
import * as plansApi from "@/lib/api/plans";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import type { CreateFinancialPlanDto, PlanFrequency } from "@/lib/types";

const FREQUENCIES: PlanFrequency[] = [
  "daily",
  "twice_a_week",
  "weekly",
  "twice_a_month",
  "monthly",
];

const emptyForm: CreateFinancialPlanDto = {
  income: 50000,
  averageExpenses: 35000,
  mandatoryExpenses: 10000,
  desiredSavings: 5000,
  goal: "",
  targetAmount: 100000,
  targetDate: "",
  frequency: "monthly",
  currency: "UAH",
};

export function PlansPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);

  const plan = useQuery({
    queryKey: queryKeys.plan,
    queryFn: plansApi.getActivePlan,
    retry: false,
  });

  const calendar = useQuery({
    queryKey: queryKeys.planCalendar,
    queryFn: plansApi.getPlanCalendar,
    enabled: plan.isSuccess,
  });

  const forecast = useQuery({
    queryKey: queryKeys.planForecast,
    queryFn: plansApi.getPlanForecast,
    enabled: plan.isSuccess,
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["plan"] });
  };

  const create = useMutation({
    mutationFn: plansApi.createPlan,
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Create failed"),
  });

  const recalc = useMutation({
    mutationFn: plansApi.recalculatePlan,
    onSuccess: invalidate,
  });

  const analyze = useMutation({
    mutationFn: plansApi.analyzeActivePlanAi,
    onSuccess: (res) => {
      setAiText(res.summary ?? res.recommendations.map((r) => r.reason).join("\n"));
    },
    onError: (err) =>
      setAiText(err instanceof ApiError ? err.message : "AI analyze failed"),
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    create.mutate({
      ...form,
      goal: form.goal.trim(),
      income: Number(form.income),
      averageExpenses: Number(form.averageExpenses),
      mandatoryExpenses: Number(form.mandatoryExpenses),
      desiredSavings: Number(form.desiredSavings),
      targetAmount: Number(form.targetAmount),
    });
  }

  const active = plan.data;
  const noActive =
    plan.isError &&
    plan.error instanceof ApiError &&
    (plan.error.status === 404 || plan.error.status === 400);

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>Financial plan</h1>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      {plan.isLoading ? <p className="status-line">Loading plan…</p> : null}

      {active ? (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>{active.overview.goal}</h2>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={recalc.isPending}
                  onClick={() => recalc.mutate()}
                >
                  Recalculate
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={analyze.isPending}
                  onClick={() => analyze.mutate()}
                >
                  AI analyze
                </button>
              </div>
            </div>
            <div className="summary-grid plan-kpis">
              <article className="summary-item">
                <p className="summary-label">Income</p>
                <p className="summary-value">
                  {formatMoney(active.overview.income, active.currency)}
                </p>
              </article>
              <article className="summary-item">
                <p className="summary-label">Actual expenses</p>
                <p className="summary-value">
                  {formatMoney(active.overview.actualExpenses, active.currency)}
                </p>
              </article>
              <article className="summary-item">
                <p className="summary-label">Savings</p>
                <p className="summary-value">
                  {formatMoney(active.overview.actualSavings, active.currency)}
                </p>
              </article>
              <article className="summary-item">
                <p className="summary-label">Progress</p>
                <p className="summary-value">
                  {active.overview.progress.percentageComplete.toFixed(1)}%
                </p>
              </article>
            </div>
            {aiText ? <p className="ai-box">{aiText}</p> : null}
          </section>

          {forecast.data ? (
            <section className="panel">
              <h2>Forecast</h2>
              <p className="period-hint">
                Track: {forecast.data.trackStatus} · Data: {forecast.data.dataStatus}
              </p>
              <p>
                Expected savings:{" "}
                {forecast.data.expectedSavings != null
                  ? formatMoney(forecast.data.expectedSavings, active.currency)
                  : "—"}
              </p>
            </section>
          ) : null}

          <section className="panel">
            <h2>Calendar (recent)</h2>
            <ul className="tx-list">
              {(calendar.data ?? []).slice(-14).map((day) => (
                <li key={day.date}>
                  <div>
                    <p className="cat-name">{day.date}</p>
                    <p className="account-meta">{day.status}</p>
                  </div>
                  <p className="account-balance">
                    {formatMoney(day.actual, active.currency)} /{" "}
                    {formatMoney(day.planned, active.currency)}
                  </p>
                </li>
              ))}
            </ul>
            {!calendar.data?.length ? <p className="empty">No calendar rows.</p> : null}
          </section>
        </>
      ) : null}

      {(noActive || !active) && !plan.isLoading ? (
        <section className="panel">
          <h2>Create plan</h2>
          <form className="stack-form" onSubmit={onCreate}>
            <div className="field">
              <label htmlFor="goal">Goal</label>
              <input
                id="goal"
                required
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="income">Income</label>
                <input
                  id="income"
                  type="number"
                  required
                  value={form.income}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, income: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="avg">Avg expenses</label>
                <input
                  id="avg"
                  type="number"
                  required
                  value={form.averageExpenses}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      averageExpenses: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="mand">Mandatory</label>
                <input
                  id="mand"
                  type="number"
                  required
                  value={form.mandatoryExpenses}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mandatoryExpenses: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="save">Desired savings</label>
                <input
                  id="save"
                  type="number"
                  required
                  value={form.desiredSavings}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      desiredSavings: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="target">Target amount</label>
                <input
                  id="target"
                  type="number"
                  required
                  value={form.targetAmount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetAmount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="tdate">Target date</label>
                <input
                  id="tdate"
                  type="date"
                  required
                  value={form.targetDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="freq">Frequency</label>
              <select
                id="freq"
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    frequency: e.target.value as PlanFrequency,
                  }))
                }
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create plan"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
