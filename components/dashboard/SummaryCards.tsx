import { formatMoney } from "@/lib/format";

type Props = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  net: number;
  currency: string;
};

const items: Array<{ key: keyof Omit<Props, "currency">; label: string }> = [
  { key: "balance", label: "Balance" },
  { key: "income", label: "Income" },
  { key: "expenses", label: "Expenses" },
  { key: "savings", label: "Savings" },
  { key: "net", label: "Net" },
];

export function SummaryCards(props: Props) {
  return (
    <section className="summary-grid" aria-label="Period summary">
      {items.map(({ key, label }) => {
        const value = props[key];
        const tone =
          key === "income" || (key === "net" && value >= 0)
            ? "positive"
            : key === "expenses" || (key === "net" && value < 0)
              ? "negative"
              : "neutral";
        return (
          <article key={key} className={`summary-item tone-${tone}`}>
            <p className="summary-label">{label}</p>
            <p className="summary-value">{formatMoney(value, props.currency)}</p>
          </article>
        );
      })}
    </section>
  );
}
