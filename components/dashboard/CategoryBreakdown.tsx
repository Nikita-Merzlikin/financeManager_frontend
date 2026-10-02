import { formatMoney } from "@/lib/format";

type Category = {
  categoryId: string | null;
  name: string;
  type: string;
  total: number;
};

export function CategoryBreakdown({
  categories,
  currency,
}: {
  categories: Category[];
  currency: string;
}) {
  const sorted = [...categories].sort((a, b) => b.total - a.total);

  return (
    <section className="panel">
      <h2>By category</h2>
      {!sorted.length ? (
        <p className="empty">No category totals yet.</p>
      ) : (
        <ul className="category-list">
          {sorted.map((cat) => (
            <li key={`${cat.categoryId ?? "none"}-${cat.type}-${cat.name}`}>
              <div>
                <p className="cat-name">{cat.name}</p>
                <p className="cat-type">{cat.type}</p>
              </div>
              <p className={`cat-total ${cat.type === "income" ? "pos" : "neg"}`}>
                {formatMoney(cat.total, currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
