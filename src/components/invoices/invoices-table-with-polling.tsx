"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import type { InvoiceDateRange, InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import type { Invoice, InvoiceStatus } from "@/lib/api/types";

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
  const hasPending = invoices.some((invoice) => invoice.status === "pending");

  useEffect(() => {
    if (!hasPending) return;
    const intervalId = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(intervalId);
  }, [hasPending, router]);

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
