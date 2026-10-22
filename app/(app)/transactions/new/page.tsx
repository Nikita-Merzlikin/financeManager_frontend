import { TransactionForm } from "@/components/transactions/TransactionForm";

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>New transaction</h1>
      </header>
      <TransactionForm mode="create" />
    </div>
  );
}
