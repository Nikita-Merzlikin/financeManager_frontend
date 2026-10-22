import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppNav } from "@/components/app/AppNav";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="app-shell">
        <AppNav />
        <div className="app-content">{children}</div>
      </div>
    </AuthGuard>
  );
}
