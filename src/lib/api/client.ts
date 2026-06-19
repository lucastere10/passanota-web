import type { ApiError, CaptureInvoiceResponse, SemanticSearchResponse } from "@/lib/api/types";

import { getClientAuthHeaders } from "@/lib/auth/client";

type ClientFetchOptions = {
  method?: "GET" | "POST" | "PATCH";
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

export function searchSemanticClient(query: string, limit = 20) {
  return clientFetch<SemanticSearchResponse>("/v1/search/semantic", {
    method: "POST",
    body: { query, limit },
  });
}
