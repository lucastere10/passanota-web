import Link from "next/link";

import { StatusBadge } from "@/components/invoices/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma nota encontrada.</p>
        <Link href="/scan" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
          Capturar primeira nota
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Emitente
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              UF
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const emitterName =
              invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "—";

            return (
              <TableRow key={invoice.id} className="[content-visibility:auto]">
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {formatDateTime(invoice.issued_at)}
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <Link
                    href={`/notas/${invoice.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {emitterName}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{invoice.uf ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  {formatCurrency(invoice.total_amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
