import type { InvoiceStatus } from "@/lib/api/types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  parsed: "Processada",
  pending: "Processando",
  failed: "Falhou",
};

export type InvoiceSortField = "created_at" | "issued_at" | "status";
export type InvoiceSortOrder = "asc" | "desc";
export type InvoiceDateRange = "day" | "week" | "month";

export const INVOICE_SORT_LABELS: Record<InvoiceSortField, string> = {
  created_at: "Registro",
  issued_at: "Emissão",
  status: "Status",
};
