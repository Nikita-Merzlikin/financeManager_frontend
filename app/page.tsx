"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export default function HomePage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted)]">Loading…</p>
    </div>
  );
}
