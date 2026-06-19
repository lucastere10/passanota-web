import { cookies } from "next/headers";

import { EMPRESA_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function getEmpresaId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(EMPRESA_COOKIE)?.value ?? null;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  const empresaId = await getEmpresaId();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (empresaId) headers["X-Empresa-Id"] = empresaId;
  return headers;
}
