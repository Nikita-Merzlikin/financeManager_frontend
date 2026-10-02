"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";

export function RegisterForm() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="field-row">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="auth-switch">
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
