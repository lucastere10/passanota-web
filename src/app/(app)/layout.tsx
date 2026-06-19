import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { EmpresaProvider } from "@/components/providers/empresa-provider";
import { getMeServer } from "@/lib/api/auth-server";
import { EMPRESA_COOKIE } from "@/lib/auth/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let me;
  try {
    me = await getMeServer();
  } catch {
    redirect("/login");
  }

  if (me.pending_invite) {
    redirect("/auth/complete-profile");
  }

  if (!me.profile_complete && !me.is_platform_admin) {
    redirect("/auth/complete-profile");
  }

  if (me.empresas.length === 0 && me.is_platform_admin) {
    redirect("/admin/empresas");
  }

  if (me.empresas.length === 0) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  if (!cookieStore.get(EMPRESA_COOKIE)?.value && me.empresas.length >= 1) {
    cookieStore.set(EMPRESA_COOKIE, me.empresas[0].id, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return (
    <EmpresaProvider initialMe={me}>
      <AppShell>{children}</AppShell>
    </EmpresaProvider>
  );
}
