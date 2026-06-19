"use client";

import { ScanPanel } from "@/components/scan/scan-panel";
import { captureInvoiceDeviceClient } from "@/lib/api/device-client";

export default function MobileScanPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Capturar nota</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tire uma foto da nota fiscal para registrar.
        </p>
      </div>
      <ScanPanel captureFn={captureInvoiceDeviceClient} />
    </div>
  );
}
