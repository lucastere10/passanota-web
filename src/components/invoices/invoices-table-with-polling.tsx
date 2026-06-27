"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import { getInvoiceClient } from "@/lib/api/client";
import type { InvoiceDateRange, InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import type { Invoice, InvoiceStatus } from "@/lib/api/types";

const POLL_INTERVAL_MS = 5000;
const MAX_CONSECUTIVE_FAILURES = 3;

export function InvoicesTableWithPolling({
  invoices,
  sortBy,
  sortOrder,
  status,
  range,
}: {
  invoices: Invoice[];
  sortBy?: InvoiceSortField;
  sortOrder?: InvoiceSortOrder;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
}) {
  const router = useRouter();
  const failuresRef = useRef(0);
  const pendingIds = invoices.filter((invoice) => invoice.status === "pending").map((i) => i.id);
  const hasPending = pendingIds.length > 0;

  useEffect(() => {
    if (!hasPending) {
      failuresRef.current = 0;
      return;
    }

    const intervalId = window.setInterval(async () => {
      if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        window.clearInterval(intervalId);
        toast.error("Não foi possível atualizar o status das notas. Tente recarregar a página.");
        return;
      }

      try {
        await Promise.all(pendingIds.map((id) => getInvoiceClient(id)));
        failuresRef.current = 0;
        router.refresh();
      } catch {
        failuresRef.current += 1;
        if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          window.clearInterval(intervalId);
          toast.error("Serviço indisponível. Atualização automática pausada.");
        }
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [hasPending, pendingIds.join(","), router]);

  return (
    <InvoicesTable
      invoices={invoices}
      sortBy={sortBy}
      sortOrder={sortOrder}
      status={status}
      range={range}
    />
  );
}
