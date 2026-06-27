"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/invoices/status-badge";
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
        <ul className="space-y-2">
          {invoices.map((invoice) => {
            const emitterName =
              invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "Emitente não informado";

            return (
              <li key={invoice.id}>
                <Link
                  href={`/m/notas/${invoice.id}`}
                  className="block rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{emitterName}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                    <span className="shrink-0">{formatDateTime(invoice.issued_at)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
