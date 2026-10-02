import type { Account } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function AccountsList({
  accounts,
}: {
  accounts: Account[];
}) {
  return (
    <section className="panel">
      <h2>Accounts</h2>
      {!accounts.length ? (
        <p className="empty">No accounts yet.</p>
      ) : (
        <ul className="account-list">
          {accounts.map((account) => (
            <li key={account.id}>
              <div>
                <p className="account-name">{account.name}</p>
                <p className="account-meta">
                  {account.type} · {account.source}
                  {!account.isActive ? " · inactive" : ""}
                </p>
              </div>
              <p className="account-balance">
                {formatMoney(account.balance, account.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
