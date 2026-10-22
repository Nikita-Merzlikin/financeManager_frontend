"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api/client";
import * as profileApi from "@/lib/api/profile";
import { queryKeys } from "@/lib/query/keys";
import type { UpdateProfileDto } from "@/lib/types";

type Tab = "profile" | "privacy" | "preferences";

function ProfileForm({
  initial,
}: {
  initial: UpdateProfileDto & { avatar?: string | null };
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<UpdateProfileDto>({
    firstName: initial.firstName ?? "",
    lastName: initial.lastName ?? "",
    description: initial.description ?? "",
    dateOfBirth: initial.dateOfBirth ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: async () => {
      setError(null);
      setInfo("Profile saved.");
      await qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Save failed"),
  });

  const avatar = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: async () => {
      setInfo("Avatar uploaded (S3 key stored; no public URL yet).");
      await qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Upload failed"),
  });

  function onSave(e: FormEvent) {
    e.preventDefault();
    save.mutate({
      firstName: form.firstName?.trim() || undefined,
      lastName: form.lastName?.trim() || undefined,
      description: form.description?.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
    });
  }

  return (
    <section className="panel">
      <h2>Profile</h2>
      {initial.avatar ? (
        <p className="period-hint">Avatar key: {initial.avatar}</p>
      ) : (
        <p className="period-hint">No avatar uploaded.</p>
      )}
      <form className="stack-form" onSubmit={onSave}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="fn">First name</label>
            <input
              id="fn"
              value={form.firstName ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="ln">Last name</label>
            <input
              id="ln"
              value={form.lastName ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="desc">Description</label>
          <input
            id="desc"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="dob">Date of birth</label>
          <input
            id="dob"
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
            }
          />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {info ? <p className="status-line">{info}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={save.isPending}>
          Save profile
        </button>
      </form>
      <div className="field" style={{ marginTop: "1rem" }}>
        <label htmlFor="avatar">Avatar (jpg/png/webp ≤5MB)</label>
        <input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) avatar.mutate(file);
          }}
        />
      </div>
    </section>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const profile = useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.getProfile,
  });

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="tabs">
        {(["profile", "privacy", "preferences"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "tab active" : "tab"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <>
          {profile.isLoading ? <p className="status-line">Loading…</p> : null}
          {profile.error ? (
            <p className="form-error">
              {profile.error instanceof Error
                ? profile.error.message
                : "Failed to load profile"}
            </p>
          ) : null}
          {profile.data ? (
            <ProfileForm
              key={profile.data.id}
              initial={{
                firstName: profile.data.firstName ?? "",
                lastName: profile.data.lastName ?? "",
                description: profile.data.description ?? "",
                dateOfBirth: profile.data.dateOfBirth ?? "",
                avatar: profile.data.avatar,
              }}
            />
          ) : null}
        </>
      ) : null}

      {tab === "privacy" ? (
        <section className="panel">
          <h2>Privacy</h2>
          <p className="period-hint">
            `/settings` API is not in current Swagger. Privacy flags are not
            configurable from the client yet.
          </p>
        </section>
      ) : null}

      {tab === "preferences" ? (
        <section className="panel">
          <h2>Preferences</h2>
          <p className="period-hint">
            Language / currency / unit preferences endpoints are not in Swagger
            yet. Requests currently send `x-lang=uk` and `Currency=UAH`.
          </p>
        </section>
      ) : null}
    </div>
  );
}
