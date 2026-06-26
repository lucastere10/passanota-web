import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/api/types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const change = summary.change_pct;
  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;

  const cards = [
    {
      title: "Total gasto",
      value: formatCurrency(summary.total_spend),
      hint: "No período selecionado",
    },
    {
      title: "Notas registradas",
      value: String(summary.invoice_count),
      hint: "No período selecionado",
    },
    {
      title: "Ticket médio",
      value: formatCurrency(summary.avg_ticket),
      hint: "Por nota fiscal",
    },
    {
      title: "Variação",
      value: formatPercent(change),
      hint: "Vs. período anterior",
      trend: change,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="font-mono text-2xl font-semibold tracking-tight">{card.value}</p>
              {card.trend !== undefined && card.trend !== null ? (
                isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-destructive" aria-hidden />
                ) : isNegative ? (
                  <ArrowDownRight className="h-4 w-4 text-primary" aria-hidden />
                ) : null
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentInvoicesTable({
  invoices,
}: {
  invoices: Array<{
    id: string;
    created_at: string;
    issued_at: string | null;
    total_amount: string | null;
    status: string;
    emitter?: { trade_name?: string | null; legal_name?: string | null } | null;
  }>;
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-base text-muted-foreground">Nenhuma nota no período.</p>
        <Link href="/scan" className="mt-2 inline-block text-base font-medium text-primary hover:underline">
          Capturar primeira nota
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-base">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Registro</th>
            <th className="px-4 py-3 font-medium">Emissão</th>
            <th className="px-4 py-3 font-medium">Emitente</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-t border-border">
              <td className="px-4 py-3">
                <Link href={`/notas/${invoice.id}`} className="hover:text-primary hover:underline">
                  {formatDate(invoice.created_at)}
                </Link>
              </td>
              <td className="px-4 py-3 tabular-nums">{formatDate(invoice.issued_at)}</td>
              <td className="px-4 py-3">
                {invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "—"}
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(invoice.total_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
