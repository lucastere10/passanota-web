"use client";

import { Loader2, RefreshCw } from "lucide-react";

import { CaptureQueue } from "@/components/scan/capture-queue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCaptureQueue } from "@/hooks/use-capture-queue";
import { useOpencvDetection } from "@/hooks/use-opencv-detection";
import type { CaptureInvoiceResponse, Invoice } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type CameraScannerProps = {
  captureFn: (file: File) => Promise<CaptureInvoiceResponse>;
  getInvoiceFn?: (id: string) => Promise<Invoice>;
  invoiceHref?: (invoiceId: string) => string;
  layout?: "default" | "mobile";
  className?: string;
};

export function CameraScanner({
  captureFn,
  getInvoiceFn,
  invoiceHref,
  layout = "default",
  className,
}: CameraScannerProps) {
  const { items, addItem } = useCaptureQueue({ captureFn, getInvoiceFn });

  const {
    setVideoRef,
    isCooldown,
    cooldownSecondsLeft,
    isBlurry,
    isCapturing,
    cameraError,
    videoReady,
    retryCamera,
    manualCapture,
  } = useOpencvDetection({
    onCapture: (file, thumbnail) => {
      void addItem(file, thumbnail);
    },
  });

  const shutterDisabled = isCooldown || isCapturing;
  const isMobile = layout === "mobile";

  const shutterControls = !cameraError && videoReady ? (
    <>
      {isCooldown && cooldownSecondsLeft > 0 ? (
        <span className="animate-pulse rounded-full bg-orange-500/90 px-4 py-1.5 text-xs font-semibold text-white">
          Aguarde {cooldownSecondsLeft}s
        </span>
      ) : null}
      <ShutterButton disabled={shutterDisabled} onClick={manualCapture} />
    </>
  ) : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border",
        isMobile ? "flex h-full min-h-0 flex-1 flex-col" : "space-y-0",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full bg-muted/40",
          isMobile ? "min-h-0 flex-1 overflow-hidden" : "aspect-[3/4] sm:aspect-video",
        )}
      >
        <video
          ref={setVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-white transition-opacity duration-150",
            isCapturing ? "opacity-60" : "opacity-0",
          )}
        />

        {!videoReady && !cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex items-center gap-2 text-sm text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              Iniciando câmera…
            </div>
          </div>
        ) : null}

        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-6 text-center">
            <p className="text-sm text-white">{cameraError}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void retryCamera()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!cameraError && videoReady ? (
          <>
            <FocusHint isBlurry={isBlurry && !isCooldown} />

            {isMobile && items.length > 0 ? (
              <CaptureQueue items={items} invoiceHref={invoiceHref} variant="overlay" />
            ) : null}

            {!isMobile ? (
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-3">
                {shutterControls}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {isMobile && shutterControls ? (
        <div className="flex shrink-0 flex-col items-center gap-1.5 px-3 py-2">
          {shutterControls}
        </div>
      ) : null}

      {!isMobile ? <CaptureQueue items={items} invoiceHref={invoiceHref} /> : null}

      {!isMobile && items.some((item) => item.status === "failed") ? (
        <Alert variant="destructive" className="m-3 mt-0">
          <AlertTitle>Falha em uma captura</AlertTitle>
          <AlertDescription>
            Algumas fotos não puderam ser enviadas ou processadas. Continue apontando a câmera para
            novas notas.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function ShutterButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Capturar foto"
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-foreground/20 bg-muted transition-all active:scale-95",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-muted/80",
      )}
    >
      <span className="h-10 w-10 rounded-full bg-foreground/90" />
    </button>
  );
}

function FocusHint({ isBlurry }: { isBlurry: boolean }) {
  if (!isBlurry) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
      <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        Ajuste o foco — aproxime a câmera
      </span>
    </div>
  );
}
