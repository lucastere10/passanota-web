import { mutate } from "swr";

import type { PaginatedInvoices } from "@/lib/api/types";
import type { InvoiceListQuery } from "@/lib/invoices/query";

export const INVOICES_SWR_PREFIX = "invoices";

export type InvoicesSwrKey = readonly [
  typeof INVOICES_SWR_PREFIX,
  string,
  number,
  string,
  string,
  InvoiceListQuery["sort_by"],
  InvoiceListQuery["sort_order"],
];

export function invoicesSwrKey(empresaId: string, query: InvoiceListQuery): InvoicesSwrKey {
  return [
    INVOICES_SWR_PREFIX,
    empresaId,
    query.page,
    query.status ?? "",
    query.range ?? "",
    query.sort_by,
    query.sort_order,
  ];
}

export function invoicesKeysMatch(left: InvoicesSwrKey, right: InvoicesSwrKey) {
  return left.every((part, index) => part === right[index]);
}

export function isInvoicesSwrKey(key: unknown): key is InvoicesSwrKey {
  return Array.isArray(key) && key[0] === INVOICES_SWR_PREFIX;
}

export function revalidateInvoiceLists(removedId?: string) {
  return mutate(
    isInvoicesSwrKey,
    (current: PaginatedInvoices | undefined) => {
      if (!current || !removedId) return current;
      return {
        ...current,
        data: current.data.filter((invoice) => invoice.id !== removedId),
        total: Math.max(0, current.total - 1),
      };
    },
    { revalidate: true },
  );
}
