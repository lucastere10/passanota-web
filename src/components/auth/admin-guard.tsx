"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getMeClient } from "@/lib/api/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const me = await getMeClient();
        if (!me.is_platform_admin) {
          router.replace("/dashboard");
          return;
        }
        setAllowed(true);
      } catch {
        router.replace("/login");
      }
    }

    void verifyAdmin();
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
