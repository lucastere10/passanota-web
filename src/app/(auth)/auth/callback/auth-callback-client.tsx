"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getMeClient } from "@/lib/api/auth";
import { resolvePostLoginPath } from "@/lib/auth/post-login-redirect";
import { createClient } from "@/lib/supabase/client";

type AuthCallbackClientProps = {
  next: string;
};

export function AuthCallbackClient({ next }: AuthCallbackClientProps) {
  const router = useRouter();

  useEffect(() => {
    async function handleImplicitCallback() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) {
        router.replace("/login?error=auth");
        return;
      }

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        router.replace("/login?error=auth");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        router.replace("/login?error=auth");
        return;
      }

      const me = await getMeClient();
      router.replace(resolvePostLoginPath(me, next));
    }

    void handleImplicitCallback();
  }, [router, next]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Entrando...</p>
    </div>
  );
}
