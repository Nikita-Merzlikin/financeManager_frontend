"use client";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  onApply: () => void;
};

export function PeriodFilter({ from, to, onChange, onApply }: Props) {
  return (
    <form
      className="period-filter"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="field">
        <label htmlFor="from">From</label>
        <input
          id="from"
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </div>
      <div className="field">
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </div>
      <button type="submit" className="btn btn-secondary">
        Apply
      </button>
    </form>
  );
}
