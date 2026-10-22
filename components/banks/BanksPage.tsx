"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import * as banksApi from "@/lib/api/banks";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function BanksPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: queryKeys.banks,
    queryFn: banksApi.listConnections,
  });

  const [monoToken, setMonoToken] = useState("");
  const [monoLabel, setMonoLabel] = useState("");
  const [privat, setPrivat] = useState({
    clientId: "",
    token: "",
    iban: "",
    label: "",
  });
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: queryKeys.banks });
    await qc.invalidateQueries({ queryKey: queryKeys.accounts });
    await qc.invalidateQueries({ queryKey: ["transactions"] });
    await qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const connectMono = useMutation({
    mutationFn: banksApi.connectMonobank,
    onSuccess: async () => {
      setMonoToken("");
      setMonoLabel("");
      setError(null);
      await invalidate();
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Mono connect failed"),
  });

  const connectPrivat = useMutation({
    mutationFn: banksApi.connectPrivat,
    onSuccess: async () => {
      setPrivat({ clientId: "", token: "", iban: "", label: "" });
      setError(null);
      await invalidate();
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Privat connect failed"),
  });

  const sync = useMutation({
    mutationFn: (id: string) => banksApi.syncConnection(id, 30),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: banksApi.deleteConnection,
    onSuccess: invalidate,
  });

  function onMono(e: FormEvent) {
    e.preventDefault();
    connectMono.mutate({
      token: monoToken.trim(),
      label: monoLabel.trim() || undefined,
    });
  }

  function onPrivat(e: FormEvent) {
    e.preventDefault();
    connectPrivat.mutate({
      clientId: privat.clientId.trim(),
      token: privat.token.trim(),
      iban: privat.iban.trim(),
      label: privat.label.trim() || undefined,
    });
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>Banks</h1>
        <p className="period-hint">Connect Monobank or Privat and sync accounts.</p>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="two-col">
        <section className="panel">
          <h2>Monobank</h2>
          <form className="stack-form" onSubmit={onMono}>
            <div className="field">
              <label htmlFor="mono-token">X-Token</label>
              <input
                id="mono-token"
                required
                value={monoToken}
                onChange={(e) => setMonoToken(e.target.value)}
                placeholder="From api.monobank.ua"
              />
            </div>
            <div className="field">
              <label htmlFor="mono-label">Label</label>
              <input
                id="mono-label"
                value={monoLabel}
                onChange={(e) => setMonoLabel(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={connectMono.isPending}>
              Connect
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>PrivatBank</h2>
          <form className="stack-form" onSubmit={onPrivat}>
            <div className="field">
              <label htmlFor="p-client">Client ID</label>
              <input
                id="p-client"
                required
                value={privat.clientId}
                onChange={(e) => setPrivat((p) => ({ ...p, clientId: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="p-token">Token</label>
              <input
                id="p-token"
                required
                value={privat.token}
                onChange={(e) => setPrivat((p) => ({ ...p, token: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="p-iban">IBAN</label>
              <input
                id="p-iban"
                required
                value={privat.iban}
                onChange={(e) => setPrivat((p) => ({ ...p, iban: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="p-label">Label</label>
              <input
                id="p-label"
                value={privat.label}
                onChange={(e) => setPrivat((p) => ({ ...p, label: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={connectPrivat.isPending}>
              Connect
            </button>
          </form>
        </section>
      </div>

      <section className="panel">
        <h2>Connections</h2>
        {list.isLoading ? <p className="status-line">Loading…</p> : null}
        <ul className="account-list">
          {(list.data ?? []).map((c) => (
            <li key={c.id}>
              <div>
                <p className="account-name">
                  {c.label || c.provider} · {c.provider}
                </p>
                <p className="account-meta">
                  Last sync: {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleString() : "never"}
                </p>
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={sync.isPending}
                  onClick={() => sync.mutate(c.id)}
                >
                  Sync
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm("Disconnect bank?")) remove.mutate(c.id);
                  }}
                >
                  Disconnect
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.data?.length === 0 ? <p className="empty">No bank connections.</p> : null}
      </section>
    </div>
  );
}
