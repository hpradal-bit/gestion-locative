"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

export type CashFlowChartPoint = {
  label: string;
  revenue: number;
  expenses: number;
  loan: number;
  cashFlow: number;
};

export function CashFlowChart({ data }: { data: CashFlowChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
          width={64}
          tickFormatter={(value: number) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="revenue" name="Revenus" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Dépenses" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="loan" name="Crédit" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="cashFlow"
          name="Cash-flow"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
