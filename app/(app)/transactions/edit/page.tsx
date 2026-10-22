import { Suspense } from "react";
import { EditTransactionPage } from "@/components/transactions/EditTransactionPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="status-line">Loading…</p>}>
      <EditTransactionPage />
    </Suspense>
  );
}
