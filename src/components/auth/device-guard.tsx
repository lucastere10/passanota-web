"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { hasDeviceToken } from "@/lib/auth/device";

export function DeviceGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasDeviceToken()) {
      router.replace("/m/pair");
      return;
    }
    setAllowed(true);
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
