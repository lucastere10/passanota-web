import type {
  AdminEmpresaClearDataResponse,
  AdminEmpresaCreate,
  AdminEmpresaDetail,
  AdminEmpresaListItem,
  AdminEmpresaUpdate,
  AdminPlatformOverview,
  AuthMeResponse,
  EmpresaUsage,
  InterestRequest,
} from "@/lib/api/types";

import { clientFetch } from "@/lib/api/client";
import { getClientAuthHeaders } from "@/lib/auth/client";

export async function sendMagicLink(email: string) {
  return clientFetch<{ message: string }>("/v1/auth/magic-link", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function submitInterest(payload: InterestRequest) {
  return clientFetch<{ message: string }>("/v1/public/interesse", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function getMeClient() {
  return clientFetch<AuthMeResponse>("/v1/auth/me");
}

export async function completeProfileClient(nome: string) {
  return clientFetch<AuthMeResponse>("/v1/auth/complete-profile", {
    method: "POST",
    body: { nome },
  });
}

export async function getAdminOverview() {
  return clientFetch<AdminPlatformOverview>("/v1/admin/overview");
}

export async function createEmpresaAdmin(payload: AdminEmpresaCreate) {
  return clientFetch("/v1/admin/empresas", {
    method: "POST",
    body: payload,
  });
}

export async function listEmpresasAdmin() {
  return clientFetch<AdminEmpresaListItem[]>("/v1/admin/empresas");
}

export async function getAdminEmpresa(id: string) {
  return clientFetch<AdminEmpresaDetail>(`/v1/admin/empresas/${id}`);
}

export async function updateAdminEmpresa(id: string, data: AdminEmpresaUpdate) {
  return clientFetch<AdminEmpresaDetail>(`/v1/admin/empresas/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function resendGestorInvite(empresaId: string, email: string) {
  return clientFetch(`/v1/admin/empresas/${empresaId}/convites`, {
    method: "POST",
    body: { email },
  });
}

export async function clearEmpresaDataAdmin(id: string, confirm_nome: string) {
  return clientFetch<AdminEmpresaClearDataResponse>(
    `/v1/admin/empresas/${id}/clear-data`,
    {
      method: "POST",
      body: { confirm_nome },
    },
  );
}

export function getEmpresaUsageClient(empresaId: string) {
  return clientFetch<EmpresaUsage>(`/v1/empresas/${empresaId}/usage`);
}

export { getClientAuthHeaders };
