import type { AuthMeResponse } from "@/lib/api/types";

export function resolvePostLoginPath(me: AuthMeResponse, next = "/dashboard"): string {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (me.pending_invite || (!me.profile_complete && !me.is_platform_admin)) {
    return `/auth/complete-profile?next=${encodeURIComponent(safeNext)}`;
  }

  if (me.is_platform_admin && me.empresas.length === 0) {
    return "/admin/overview";
  }

  return safeNext;
}
