import type {
  ApiError,
  CaptureInvoiceResponse,
  CategoryListResponse,
  Invoice,
  InvoiceItem,
  SemanticSearchResponse,
  UpdateInvoiceItemRequest,
  UpdateInvoiceRequest,
} from "@/lib/api/types";

import { getClientAuthHeaders } from "@/lib/auth/client";

type ClientFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined | null>;
  auth?: boolean;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((item) => item.msg).join(", ");
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  if (response.status === 401) return "Sessão expirada ou inválida.";
  return `Erro (${response.status})`;
}

export async function clientFetch<T>(
  path: string,
  { method = "GET", body, searchParams, auth = true }: ClientFetchOptions = {},
): Promise<T> {
  const url = new URL(`/api/proxy${path}`, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, await getClientAuthHeaders());

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function captureInvoiceClient(file: File) {
  const form = new FormData();
  form.append("file", file);

  const authHeaders = await getClientAuthHeaders();
  const response = await fetch("/api/proxy/v1/invoices/capture", {
    method: "POST",
    headers: authHeaders,
    body: form,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CaptureInvoiceResponse;
}

export function getInvoiceClient(id: string) {
  return clientFetch<Invoice>(`/v1/invoices/${id}`);
}

export function searchSemanticClient(query: string, limit = 20) {
  return clientFetch<SemanticSearchResponse>("/v1/search/semantic", {
    method: "POST",
    body: { query, limit },
  });
}

export function updateInvoiceClient(id: string, data: UpdateInvoiceRequest) {
  return clientFetch<Invoice>(`/v1/invoices/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteInvoiceClient(id: string) {
  return clientFetch<void>(`/v1/invoices/${id}`, { method: "DELETE" });
}

export function getCategoriesClient() {
  return clientFetch<CategoryListResponse>("/v1/categories");
}

export function updateInvoiceItemClient(
  invoiceId: string,
  itemId: string,
  data: UpdateInvoiceItemRequest,
) {
  return clientFetch<InvoiceItem>(`/v1/invoices/${invoiceId}/items/${itemId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteInvoiceItemClient(invoiceId: string, itemId: string) {
  return clientFetch<void>(`/v1/invoices/${invoiceId}/items/${itemId}`, {
    method: "DELETE",
  });
}
