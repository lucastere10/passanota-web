"use client";

import { ScanPanel } from "@/components/scan/scan-panel";
import {
  captureInvoiceDeviceClient,
  getInvoiceDeviceClient,
} from "@/lib/api/device-client";

export default function MobileScanPage() {
  return (
    <ScanPanel
      variant="mobile"
      captureFn={captureInvoiceDeviceClient}
      getInvoiceFn={getInvoiceDeviceClient}
      notasHref="/m/notas"
      invoiceHref={(id) => `/m/notas/${id}`}
      defaultMode="camera"
    />
  );
}
