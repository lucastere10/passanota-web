import { EMPRESA_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";

function getEmpresaIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${EMPRESA_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setEmpresaCookie(empresaId: string) {
  document.cookie = `${EMPRESA_COOKIE}=${encodeURIComponent(empresaId)}; path=/; max-age=31536000; SameSite=Lax`;
}

export async function getClientAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const empresaId = getEmpresaIdFromCookie();
  if (empresaId) headers["X-Empresa-Id"] = empresaId;
  return headers;
}

export async function signOutClient() {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" });
  document.cookie = `${EMPRESA_COOKIE}=; path=/; max-age=0`;

  try {
    await fetch("/auth/signout", { method: "POST", redirect: "manual" });
  } catch {
    // Server route clears HttpOnly auth cookies when available.
  }

  window.location.assign("/login");
}
