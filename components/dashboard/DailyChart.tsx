import { formatDateLabel } from "@/lib/format";

type Point = { date: string; income: number; expense: number };

export function DailyChart({ series }: { series: Point[] }) {
  if (!series.length) {
    return (
      <section className="panel">
        <h2>Daily cash flow</h2>
        <p className="empty">No activity in this period.</p>
      </section>
    );
  }

  const max = Math.max(
    1,
    ...series.flatMap((p) => [p.income, p.expense]),
  );

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Daily cash flow</h2>
        <div className="legend">
          <span className="legend-dot income" /> Income
          <span className="legend-dot expense" /> Expense
        </div>
      </div>
      <div className="chart" role="img" aria-label="Daily income and expense chart">
        {series.map((point) => {
          const incomeH = (point.income / max) * 100;
          const expenseH = (point.expense / max) * 100;
          return (
            <div key={point.date} className="chart-col">
              <div className="chart-bars">
                <div
                  className="bar income"
                  style={{ height: `${incomeH}%` }}
                  title={`Income: ${point.income}`}
                />
                <div
                  className="bar expense"
                  style={{ height: `${expenseH}%` }}
                  title={`Expense: ${point.expense}`}
                />
              </div>
              <span className="chart-label">{formatDateLabel(point.date)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
