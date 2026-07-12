export type Point = [number, number];

export type DetectionState = "idle" | "detecting" | "stable" | "capturing" | "cooldown";

/** Derived visual state used by the UI — independent of internal DetectionState. */
export type CameraVisualState =
  | "blur"        // sharpness too low
  | "searching"   // nítido mas sem nota detectada / guide ainda instável
  | "detecting"   // contorno encontrado, estabilizando
  | "ready"       // contorno estável OU guide nítido por 1200ms — pronto para capturar
  | "capturing"   // flash de captura
  | "cooldown";   // aguardando próxima captura

export type DetectionMode = "contour" | "guide" | "none";

export type WorkerDetectMessage = {
  type: "detect";
  imageData: ImageData;
  width: number;
  height: number;
};

export type WorkerReadyMessage = {
  type: "ready";
};

export type WorkerResultMessage = {
  type: "result";
  detected: boolean;
  polygon: Point[] | null;
  areaRatio: number;
  mode: DetectionMode;
  sharpness: number;
};

export type WorkerErrorMessage = {
  type: "error";
  message: string;
};

export type WorkerOutboundMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage;

export type QueueItemStatus = "uploading" | "pending" | "parsed" | "failed";

export interface CaptureQueueItem {
  localId: string;
  invoiceId: string | null;
  thumbnailDataUrl: string;
  status: QueueItemStatus;
  invoice?: import("@/lib/api/types").Invoice;
  capturedAt: number;
  errorMessage?: string;
}

/** Margens da área guia — devem coincidir com o overlay no hook. */
export const GUIDE_MARGIN_X = 0.1;
export const GUIDE_MARGIN_Y = 0.15;

export function buildGuidePolygon(width: number, height: number): Point[] {
  const mx = width * GUIDE_MARGIN_X;
  const my = height * GUIDE_MARGIN_Y;
  return [
    [mx, my],
    [width - mx, my],
    [width - mx, height - my],
    [mx, height - my],
  ];
}
