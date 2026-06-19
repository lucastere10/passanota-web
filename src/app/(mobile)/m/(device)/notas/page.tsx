"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/invoices/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeviceInvoicesClient } from "@/lib/api/device-client";
import type { Invoice } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function MobileNotasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getDeviceInvoicesClient(1, 20);
        setInvoices(data.data);
        setTotal(data.total);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar notas.");
      }
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Notas capturadas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} nota(s) registrada(s) por este dispositivo
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma nota capturada ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Emitente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDateTime(invoice.issued_at)}</TableCell>
                  <TableCell>
                    {invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
