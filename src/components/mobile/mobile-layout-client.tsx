"use client";

import { useEffect, useState } from "react";

import { DeviceGuard } from "@/components/auth/device-guard";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { getDeviceMeClient } from "@/lib/api/device-client";
import type { DeviceMe } from "@/lib/api/types";

export function MobileLayoutClient({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceMe | null>(null);

  useEffect(() => {
    getDeviceMeClient()
      .then(setDevice)
      .catch(() => setDevice(null));
  }, []);

  return (
    <DeviceGuard>
      <MobileShell empresaNome={device?.empresa_nome}>{children}</MobileShell>
    </DeviceGuard>
  );
}
