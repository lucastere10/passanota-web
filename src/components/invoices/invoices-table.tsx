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
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Emitente</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="[content-visibility:auto]">
              <TableCell>
                <Link href={`/notas/${invoice.id}`} className="hover:text-primary hover:underline">
                  {formatDateTime(invoice.issued_at)}
                </Link>
              </TableCell>
              <TableCell>
                {invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "—"}
              </TableCell>
              <TableCell>{invoice.uf ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(invoice.total_amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
