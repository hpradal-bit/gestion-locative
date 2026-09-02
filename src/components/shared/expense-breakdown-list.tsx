import { formatCurrency } from "@/lib/format";
import type { ExpenseCategoryAmount } from "@/features/dashboard/types";

export function ExpenseBreakdownList({ data }: { data: ExpenseCategoryAmount[] }) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const max = sorted[0]?.amount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((item) => (
        <div key={item.category} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>{item.category}</span>
            <span className="font-medium tabular-nums">{formatCurrency(item.amount)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: max > 0 ? `${(item.amount / max) * 100}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
