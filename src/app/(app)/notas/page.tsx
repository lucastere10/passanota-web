import Link from "next/link";
import { Suspense } from "react";

import { InvoicesTableWithPolling } from "@/components/invoices/invoices-table-with-polling";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getInvoices } from "@/lib/api/server";
import type { InvoiceStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; uf?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const uf = params.uf;
  const status = params.status as InvoiceStatus | undefined;

  const data = await getInvoices({ page, page_size: 20, uf, status });
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas fiscais"
        description={`${data.total} notas registradas`}
        actions={
          <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-md bg-muted" />}>
            <InvoiceFilters currentUf={uf} currentStatus={status} />
          </Suspense>
        }
      />

      <InvoicesTableWithPolling invoices={data.data} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {data.page} de {totalPages}
        </p>
        <div className="flex gap-2">
          {data.page > 1 ? (
            <Link
              href={`/notas?page=${data.page - 1}${uf ? `&uf=${uf}` : ""}${status ? `&status=${status}` : ""}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Anterior
            </Link>
          ) : null}
          {data.page < totalPages ? (
            <Link
              href={`/notas?page=${data.page + 1}${uf ? `&uf=${uf}` : ""}${status ? `&status=${status}` : ""}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Próxima
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
