import { GuestGuard } from "@/components/auth/AuthGuard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <main className="auth-shell">
        <div className="auth-panel">
          <p className="brand-mark">Ledgerly</p>
          <h1>Create account</h1>
          <p className="auth-lead">Start tracking income, expenses, and savings.</p>
          <RegisterForm />
        </div>
      </main>
    </GuestGuard>
  );
}
