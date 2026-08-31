import type { SimulationResult } from "@/lib/finance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

const ROWS: {
  label: string;
  value: (r: SimulationResult) => string;
}[] = [
  { label: "Coût total", value: (r) => formatCurrency(r.totalProjectCost) },
  { label: "Apport nécessaire", value: (r) => formatCurrency(r.downPaymentRequired) },
  { label: "Mensualité", value: (r) => formatCurrency(r.monthlyPayment) },
  { label: "Rentabilité brute", value: (r) => formatPercent(r.grossYield) },
  { label: "Rentabilité nette", value: (r) => formatPercent(r.netYield) },
  { label: "Cash-flow mensuel", value: (r) => formatCurrency(r.cashFlowMonthly) },
  { label: "Cash-flow annuel", value: (r) => formatCurrency(r.cashFlowAnnual) },
  { label: "Rendement du capital investi", value: (r) => formatPercent(r.returnOnInvestment) },
  { label: "Score", value: (r) => `${r.score}/100` },
];

export function ComparisonTable({
  resultA,
  resultB,
}: {
  resultA: SimulationResult;
  resultB: SimulationResult;
}) {
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicateur</TableHead>
            <TableHead>Scénario A</TableHead>
            <TableHead>Scénario B</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-muted-foreground">{row.label}</TableCell>
              <TableCell className="font-medium">{row.value(resultA)}</TableCell>
              <TableCell className="font-medium">{row.value(resultB)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
