import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { InvoiceDeleteButton } from "@/components/invoices/invoice-delete-button";
import { StatusBadge } from "@/components/invoices/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceSortField, InvoiceSortOrder, InvoiceDateRange } from "@/lib/invoices/constants";
import { invoicesHref, toggleSort } from "@/lib/invoices/query";
import type { Invoice, InvoiceStatus } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function SortableHead({
  field,
  label,
  sortBy,
  sortOrder,
  status,
  range,
  className,
}: {
  field: InvoiceSortField;
  label: string;
  sortBy: InvoiceSortField;
  sortOrder: InvoiceSortOrder;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
  className?: string;
}) {
  const active = sortBy === field;
  const next = toggleSort(field, sortBy, sortOrder);
  const href = invoicesHref({
    status,
    range,
    sort_by: next.sort_by,
    sort_order: next.sort_order,
  });

  const Icon = active ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </Link>
    </TableHead>
  );
}

export function InvoicesTable({
  invoices,
  sortBy = "created_at",
  sortOrder = "desc",
  status,
  range,
}: {
  invoices: Invoice[];
  sortBy?: InvoiceSortField;
  sortOrder?: InvoiceSortOrder;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
}) {
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
            <SortableHead
              field="created_at"
              label="Registro"
              sortBy={sortBy}
              sortOrder={sortOrder}
              status={status}
              range={range}
              className="text-xs font-medium uppercase tracking-wide"
            />
            <SortableHead
              field="issued_at"
              label="Emissão"
              sortBy={sortBy}
              sortOrder={sortOrder}
              status={status}
              range={range}
              className="text-xs font-medium uppercase tracking-wide"
            />
            <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Emitente
            </TableHead>
            <SortableHead
              field="status"
              label="Status"
              sortBy={sortBy}
              sortOrder={sortOrder}
              status={status}
              range={range}
              className="text-xs font-medium uppercase tracking-wide"
            />
            <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const emitterName =
              invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "—";

            return (
              <TableRow key={invoice.id} className="[content-visibility:auto]">
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {formatDate(invoice.created_at)}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-muted-foreground">
                  {formatDate(invoice.issued_at)}
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <Link
                    href={`/notas/${invoice.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {emitterName}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  {formatCurrency(invoice.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  <InvoiceDeleteButton invoiceId={invoice.id} status={invoice.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
