"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="auth-switch">
        No account? <Link href="/register">Create one</Link>
      </p>
    </form>
  );
}
