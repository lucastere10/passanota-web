"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { InvoicesTable } from "@/components/invoices/invoices-table";
import type { Invoice } from "@/lib/api/types";

export function InvoicesTableWithPolling({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const hasPending = invoices.some((invoice) => invoice.status === "pending");

  useEffect(() => {
    if (!hasPending) return;
    const intervalId = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(intervalId);
  }, [hasPending, router]);

  return <InvoicesTable invoices={invoices} />;
}
