import { GuestGuard } from "@/components/auth/AuthGuard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="auth-shell">
        <div className="auth-panel">
          <p className="brand-mark">Ledgerly</p>
          <h1>Welcome back</h1>
          <p className="auth-lead">Sign in to see your balances and cash flow.</p>
          <LoginForm />
        </div>
      </main>
    </GuestGuard>
  );
}
