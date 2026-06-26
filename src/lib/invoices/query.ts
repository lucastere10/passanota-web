import type { InvoiceDateRange, InvoiceSortField, InvoiceSortOrder } from "@/lib/invoices/constants";
import type { InvoiceStatus } from "@/lib/api/types";

const BRAZIL_TZ = "America/Sao_Paulo";
const BRAZIL_OFFSET = "-03:00";

export interface InvoiceListParams {
  page?: number;
  status?: InvoiceStatus;
  range?: InvoiceDateRange;
  sort_by?: InvoiceSortField;
  sort_order?: InvoiceSortOrder;
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
