import type {
  CaptureInvoiceResponse,
  Device,
  DeviceMe,
  DevicePairResponse,
  EmpresaPinStatus,
  Invoice,
  PaginatedInvoices,
  PairingSession,
} from "@/lib/api/types";
import { getDeviceToken } from "@/lib/auth/device";

const DEVICE_TOKEN_HEADER = "X-Device-Token";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // ignore
  }
  if (response.status === 401) return "Dispositivo não autorizado.";
  return `Erro (${response.status})`;
}

function getDeviceHeaders(): Record<string, string> {
  const token = getDeviceToken();
  if (!token) throw new Error("Dispositivo não autenticado.");
  return { [DEVICE_TOKEN_HEADER]: token };
}

export async function deviceFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    searchParams?: Record<string, string | number | undefined | null>;
    auth?: boolean;
  } = {},
): Promise<T> {
  const { method = "GET", body, searchParams, auth = true } = options;
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
  if (auth) Object.assign(headers, getDeviceHeaders());

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function pairDeviceClient(payload: {
  pairing_token: string;
  pin: string;
  nome?: string;
}) {
  const url = new URL("/api/proxy/v1/devices/pair", window.location.origin);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as DevicePairResponse;
}

export async function captureInvoiceDeviceClient(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/proxy/v1/invoices/capture", {
    method: "POST",
    headers: getDeviceHeaders(),
    body: form,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as CaptureInvoiceResponse;
}

export async function getInvoiceDeviceClient(id: string) {
  return deviceFetch<Invoice>(`/v1/devices/me/invoices/${id}`);
}

export function getDeviceMeClient() {
  return deviceFetch<DeviceMe>("/v1/devices/me");
}

export function getDeviceInvoicesClient(page = 1, pageSize = 20) {
  return deviceFetch<PaginatedInvoices>("/v1/devices/me/invoices", {
    searchParams: { page, page_size: pageSize },
  });
}

export function getEmpresaPinStatusClient(empresaId: string) {
  return clientFetchEmpresa<EmpresaPinStatus>(`/v1/empresas/${empresaId}/pin`);
}

export function updateEmpresaPinClient(empresaId: string, pin: string) {
  return clientFetchEmpresa<EmpresaPinStatus>(`/v1/empresas/${empresaId}/pin`, {
    method: "PATCH",
    body: { pin },
  });
}

export function createPairingSessionClient() {
  return clientFetchEmpresa<PairingSession>("/v1/devices/pairing-sessions", { method: "POST" });
}

export function listDevicesClient() {
  return clientFetchEmpresa<Device[]>("/v1/devices");
}

export function updateDeviceClient(
  deviceId: string,
  payload: { nome?: string; is_active?: boolean },
) {
  return clientFetchEmpresa<Device>(`/v1/devices/${deviceId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function revokeDeviceClient(deviceId: string) {
  return clientFetchEmpresa<void>(`/v1/devices/${deviceId}`, { method: "DELETE" });
}

async function clientFetchEmpresa<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  const { getClientAuthHeaders } = await import("@/lib/auth/client");
  const { method = "GET", body } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  Object.assign(headers, await getClientAuthHeaders());

  const response = await fetch(`/api/proxy${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
