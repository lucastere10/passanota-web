import Link from "next/link";
import { Suspense } from "react";

import { InvoiceDateRangeFilters } from "@/components/invoices/invoice-date-range-filters";
import { InvoicesTableWithPolling } from "@/components/invoices/invoices-table-with-polling";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getInvoices } from "@/lib/api/server";
import type { InvoiceStatus } from "@/lib/api/types";
import type { InvoiceDateRange, InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import { getRegistrationDateRange, invoicesHref } from "@/lib/invoices/query";
import { cn } from "@/lib/utils";

const VALID_STATUSES = new Set<InvoiceStatus>(["parsed", "pending", "failed"]);
const VALID_RANGES = new Set<InvoiceDateRange>(["day", "week", "month"]);
const VALID_SORT_FIELDS = new Set<InvoiceSortField>(["created_at", "issued_at", "status"]);

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    range?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = VALID_STATUSES.has(params.status as InvoiceStatus)
    ? (params.status as InvoiceStatus)
    : undefined;
  const range = VALID_RANGES.has(params.range as InvoiceDateRange)
    ? (params.range as InvoiceDateRange)
    : undefined;
  const sortBy = VALID_SORT_FIELDS.has(params.sort_by as InvoiceSortField)
    ? (params.sort_by as InvoiceSortField)
    : "created_at";
  const sortOrder: InvoiceSortOrder = params.sort_order === "asc" ? "asc" : "desc";

  const dateRange = range ? getRegistrationDateRange(range) : undefined;
  const hasActiveFilters = Boolean(status || range);

  const data = await getInvoices({
    page,
    page_size: 20,
    status,
    created_from: dateRange?.created_from,
    created_to: dateRange?.created_to,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas fiscais"
        description={`${data.total} notas registradas`}
        actions={
          <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-md bg-muted" />}>
            <InvoiceFilters currentStatus={status} hasActiveFilters={hasActiveFilters} />
          </Suspense>
        }
      />

      <div className="space-y-3">
        <Suspense fallback={<div className="h-8 w-72 animate-pulse rounded-md bg-muted" />}>
          <InvoiceDateRangeFilters currentRange={range} />
        </Suspense>

        <InvoicesTableWithPolling
          invoices={data.data}
          sortBy={sortBy}
          sortOrder={sortOrder}
          status={status}
          range={range}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {data.page} de {totalPages}
        </p>
        <div className="flex gap-2">
          {data.page > 1 ? (
            <Link
              href={invoicesHref({
                page: data.page - 1,
                status,
                range,
                sort_by: sortBy,
                sort_order: sortOrder,
              })}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Anterior
            </Link>
          ) : null}
          {data.page < totalPages ? (
            <Link
              href={invoicesHref({
                page: data.page + 1,
                status,
                range,
                sort_by: sortBy,
                sort_order: sortOrder,
              })}
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
