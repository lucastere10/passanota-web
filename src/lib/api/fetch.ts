import type { ApiError } from "@/lib/api/types";

import { getApiUrl } from "@/lib/api/env";
import { withApiGatewayHeaders } from "@/lib/api/id-token";
import { getAuthHeaders } from "@/lib/auth/session";

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined | null>;
  auth?: boolean;
};

function buildUrl(path: string, searchParams?: FetchOptions["searchParams"]): string {
  const baseUrl = getApiUrl();
  const url = new URL(path.startsWith("http") ? path : `${baseUrl}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

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
  if (response.status === 403) return "Sem permissão para esta ação.";
  if (response.status === 422) return "Dados inválidos enviados à API.";
  return `Erro na API (${response.status})`;
}

export async function fetchFromApi<T>(
  path: string,
  { method = "GET", body, searchParams, auth = true }: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (auth) {
    const authHeaders = await getAuthHeaders();
    Object.assign(headers, authHeaders);
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const gatewayHeaders = await withApiGatewayHeaders(headers);

  const response = await fetch(buildUrl(path, searchParams), {
    method,
    headers: gatewayHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
