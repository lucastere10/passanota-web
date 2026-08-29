import type { InvoiceDateRange, InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import type { InvoiceStatus } from "@/lib/api/types";

const BRAZIL_TZ = "America/Sao_Paulo";
const BRAZIL_OFFSET = "-03:00";

export const INVOICE_PAGE_SIZE = 20;

const VALID_STATUSES = new Set<InvoiceStatus>(["parsed", "pending", "failed"]);
const VALID_RANGES = new Set<InvoiceDateRange>(["day", "week", "month"]);
const VALID_SORT_FIELDS = new Set<InvoiceSortField>(["created_at", "issued_at", "status"]);

export interface InvoiceListParams {
  page?: number;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
  sort_by?: InvoiceSortField;
  sort_order?: InvoiceSortOrder;
}

export interface InvoiceListQuery {
  page: number;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
  sort_by: InvoiceSortField;
  sort_order: InvoiceSortOrder;
}

export function parseInvoiceListParams(input: {
  page?: string | null;
  status?: string | null;
  range?: string | null;
  sort_by?: string | null;
  sort_order?: string | null;
}): InvoiceListQuery {
  const parsedPage = Number(input.page ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;
  const status = VALID_STATUSES.has(input.status as InvoiceStatus)
    ? (input.status as InvoiceStatus)
    : undefined;
  const range = VALID_RANGES.has(input.range as InvoiceDateRange)
    ? (input.range as InvoiceDateRange)
    : undefined;
  const sort_by = VALID_SORT_FIELDS.has(input.sort_by as InvoiceSortField)
    ? (input.sort_by as InvoiceSortField)
    : "created_at";
  const sort_order: InvoiceSortOrder = input.sort_order === "asc" ? "asc" : "desc";

  return { page, status, range, sort_by, sort_order };
}

export function parseInvoiceListParamsFromSearch(search: string): InvoiceListQuery {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return parseInvoiceListParams({
    page: params.get("page"),
    status: params.get("status"),
    range: params.get("range"),
    sort_by: params.get("sort_by"),
    sort_order: params.get("sort_order"),
  });
}

export function toInvoicesApiParams(query: InvoiceListQuery) {
  const dateRange = query.range ? getRegistrationDateRange(query.range) : undefined;
  return {
    page: query.page,
    page_size: INVOICE_PAGE_SIZE,
    status: query.status,
    created_from: dateRange?.created_from,
    created_to: dateRange?.created_to,
    sort_by: query.sort_by,
    sort_order: query.sort_order,
  };
}

function getBrazilDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return { year, month, day };
}

function brazilDateAt(year: string, month: string, day: string, time: string) {
  return new Date(`${year}-${month}-${day}T${time}${BRAZIL_OFFSET}`);
}

export function getRegistrationDateRange(range: InvoiceDateRange) {
  const { year, month, day } = getBrazilDateParts();
  const end = brazilDateAt(year, month, day, "23:59:59.999");

  if (range === "day") {
    const start = brazilDateAt(year, month, day, "00:00:00.000");
    return { created_from: start.toISOString(), created_to: end.toISOString() };
  }

  const today = brazilDateAt(year, month, day, "12:00:00.000");
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TZ,
    weekday: "short",
  }).format(today);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const daysFromMonday = (weekdayIndex + 6) % 7;

  if (range === "week") {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysFromMonday);
    const startParts = getBrazilDateParts(startDate);
    const start = brazilDateAt(startParts.year, startParts.month, startParts.day, "00:00:00.000");
    return { created_from: start.toISOString(), created_to: end.toISOString() };
  }

  const start = brazilDateAt(year, month, "01", "00:00:00.000");
  return { created_from: start.toISOString(), created_to: end.toISOString() };
}

export function buildInvoicesSearchParams(params: InvoiceListParams) {
  const query = new URLSearchParams();

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.range) {
    query.set("range", params.range);
  }
  if (params.sort_by && params.sort_by !== "created_at") {
    query.set("sort_by", params.sort_by);
  }
  if (params.sort_order && params.sort_order !== "desc") {
    query.set("sort_order", params.sort_order);
  }

  return query;
}

export function invoicesHref(params: InvoiceListParams) {
  const query = buildInvoicesSearchParams(params);
  const qs = query.toString();
  return qs ? `/notas?${qs}` : "/notas";
}

export function toggleSort(
  field: InvoiceSortField,
  current?: InvoiceSortField,
  order: InvoiceSortOrder = "desc",
): { sort_by: InvoiceSortField; sort_order: InvoiceSortOrder } {
  if (current === field) {
    return { sort_by: field, sort_order: order === "desc" ? "asc" : "desc" };
  }
  return { sort_by: field, sort_order: "desc" };
}
