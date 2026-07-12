import { cache } from "react";
import { cookies } from "next/headers";

import { EMPRESA_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

export const getAccessToken = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

export async function getEmpresaId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(EMPRESA_COOKIE)?.value ?? null;
}

export const getAuthHeaders = cache(async (): Promise<HeadersInit> => {
  const [token, empresaId] = await Promise.all([getAccessToken(), getEmpresaId()]);
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (empresaId) headers["X-Empresa-Id"] = empresaId;
  return headers;
});
