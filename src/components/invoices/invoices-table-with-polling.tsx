"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import { getInvoiceStatusesClient } from "@/lib/api/client";
import type { InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import type { Invoice } from "@/lib/api/types";

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 3;

export function InvoicesTableWithPolling({
  invoices,
  sortBy,
  sortOrder,
  onSort,
  onStatusChanged,
}: {
  invoices: Invoice[];
  sortBy?: InvoiceSortField;
  sortOrder?: InvoiceSortOrder;
  onSort: (field: InvoiceSortField) => void;
  onStatusChanged: () => void;
}) {
  const onStatusChangedRef = useRef(onStatusChanged);
  const failuresRef = useRef(0);
  const inFlightRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    onStatusChangedRef.current = onStatusChanged;
  }, [onStatusChanged]);

  const pendingIds = invoices.filter((invoice) => invoice.status === "pending").map((i) => i.id);
  const pendingKey = pendingIds.join(",");
  const hasPending = pendingIds.length > 0;

  useEffect(() => {
    if (!hasPending) {
      failuresRef.current = 0;
      startedAtRef.current = null;
      return;
    }

    startedAtRef.current = Date.now();
    const ids = pendingKey.split(",").filter(Boolean);

    const intervalId = window.setInterval(async () => {
      if (inFlightRef.current) return;

      if (startedAtRef.current != null && Date.now() - startedAtRef.current >= POLL_TIMEOUT_MS) {
        window.clearInterval(intervalId);
        toast.message("Ainda processando. Recarregue a página em alguns instantes.");
        return;
      }

      if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        window.clearInterval(intervalId);
        toast.error("Não foi possível atualizar o status das notas. Tente recarregar a página.");
        return;
      }

      inFlightRef.current = true;
      try {
        const { data } = await getInvoiceStatusesClient(ids);
        failuresRef.current = 0;
        const statusChanged = data.some((row) => row.status !== "pending");
        if (statusChanged) {
          window.clearInterval(intervalId);
          onStatusChangedRef.current();
        }
      } catch {
        failuresRef.current += 1;
        if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          window.clearInterval(intervalId);
          toast.error("Serviço indisponível. Atualização automática pausada.");
        }
      } finally {
        inFlightRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [hasPending, pendingKey]);

  return (
    <InvoicesTable invoices={invoices} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
  );
}
