import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="app-shell">
        <DashboardView />
      </main>
    </AuthGuard>
  );
}
