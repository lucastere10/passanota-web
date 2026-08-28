"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import useSWR from "swr";

import { InvoiceListFilters } from "@/components/invoices/invoice-list-filters";
import { InvoicesTableWithPolling } from "@/components/invoices/invoices-table-with-polling";
import { PageHeader } from "@/components/layout/page-header";
import { useEmpresa } from "@/components/providers/empresa-provider";
import { Button } from "@/components/ui/button";
import { getInvoicesClient } from "@/lib/api/client";
import type { InvoiceStatus, PaginatedInvoices } from "@/lib/api/types";
import type { InvoiceDateRange, InvoiceSortField } from "@/lib/invoices/constants";
import {
  invoicesHref,
  toInvoicesApiParams,
  toggleSort,
  type InvoiceListQuery,
  parseInvoiceListParamsFromSearch,
} from "@/lib/invoices/query";
import { invoicesKeysMatch, invoicesSwrKey } from "@/lib/invoices/swr";

export function NotasView({
  fallbackData,
  initialQuery,
}: {
  fallbackData: PaginatedInvoices;
  initialQuery: InvoiceListQuery;
}) {
  const { selectedEmpresaId } = useEmpresa();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onPopState = () => {
      setQuery(parseInvoiceListParamsFromSearch(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const replaceQuery = useCallback((next: InvoiceListQuery) => {
    startTransition(() => {
      setQuery(next);
      window.history.replaceState(window.history.state, "", invoicesHref(next));
    });
  }, []);

  const swrKey = selectedEmpresaId ? invoicesSwrKey(selectedEmpresaId, query) : null;
  const seedKey = selectedEmpresaId ? invoicesSwrKey(selectedEmpresaId, initialQuery) : null;
  const isSeedKey = Boolean(swrKey && seedKey && invoicesKeysMatch(swrKey, seedKey));

  const { data, error, isValidating, mutate } = useSWR(
    swrKey,
    ([, , page, status, range, sortBy, sortOrder]) =>
      getInvoicesClient(
        toInvoicesApiParams({
          page,
          status: status ? (status as InvoiceStatus) : undefined,
          range: range ? (range as InvoiceDateRange) : undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
      ),
    {
      fallbackData: isSeedKey ? fallbackData : undefined,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  const list = data ?? (isSeedKey || swrKey === null ? fallbackData : undefined);
  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.page_size)) : 1;
  const hasActiveFilters = Boolean(query.status || query.range);
  const refreshing = Boolean(list) && isValidating;

  function patchQuery(patch: Partial<InvoiceListQuery>, resetPage = true) {
    replaceQuery({
      ...query,
      ...patch,
      page: resetPage ? 1 : (patch.page ?? query.page),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas fiscais"
        description={list ? `${list.total} notas registradas` : "Carregando notas…"}
      />

      <div className="space-y-3" aria-busy={isPending || refreshing}>
        <InvoiceListFilters
          currentStatus={query.status}
          currentRange={query.range}
          hasActiveFilters={hasActiveFilters}
          disabled={isPending}
          onRangeChange={(range?: InvoiceDateRange) => patchQuery({ range })}
          onStatusChange={(status?: InvoiceStatus) => patchQuery({ status })}
          onClear={() =>
            replaceQuery({
              page: 1,
              sort_by: query.sort_by,
              sort_order: query.sort_order,
            })
          }
        />

        {error && !list ? (
          <p className="text-sm text-destructive">Não foi possível carregar as notas.</p>
        ) : null}

        {list ? (
          <div className={refreshing ? "opacity-70 transition-opacity" : undefined}>
            <InvoicesTableWithPolling
              invoices={list.data}
              sortBy={query.sort_by}
              sortOrder={query.sort_order}
              onSort={(field: InvoiceSortField) => {
                const next = toggleSort(field, query.sort_by, query.sort_order);
                patchQuery({ sort_by: next.sort_by, sort_order: next.sort_order });
              }}
              onStatusChanged={() => {
                void mutate();
              }}
            />
          </div>
        ) : null}
      </div>

      {list ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {list.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {list.page > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => patchQuery({ page: list.page - 1 }, false)}
              >
                Anterior
              </Button>
            ) : null}
            {list.page < totalPages ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => patchQuery({ page: list.page + 1 }, false)}
              >
                Próxima
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
