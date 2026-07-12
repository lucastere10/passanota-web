"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DropZone, FilePreview } from "@/components/scan/drop-zone";
import { CaptureStatusTracker } from "@/components/scan/capture-status-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { captureInvoiceClient } from "@/lib/api/client";
import type { CaptureInvoiceResponse, Invoice } from "@/lib/api/types";

const CameraScannerDefault = dynamic(
  () => import("@/components/scan/camera-scanner").then((mod) => mod.CameraScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-border bg-muted/30 sm:aspect-video">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

const CameraScannerMobile = dynamic(
  () => import("@/components/scan/camera-scanner").then((mod) => mod.CameraScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center rounded-xl border border-border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

type CaptureMode = "file" | "camera";

type ScanPanelProps = {
  captureFn?: (file: File) => Promise<CaptureInvoiceResponse>;
  getInvoiceFn?: (id: string) => Promise<Invoice>;
  notasHref?: string;
  invoiceHref?: (invoiceId: string) => string;
  defaultMode?: CaptureMode;
  showModeToggle?: boolean;
  variant?: "default" | "mobile";
};

export function ScanPanel({
  captureFn = captureInvoiceClient,
  getInvoiceFn,
  notasHref = "/notas",
  invoiceHref,
  defaultMode = "file",
  showModeToggle = true,
  variant = "default",
}: ScanPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CaptureMode>(defaultMode);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const processingRef = useRef(false);

  function resetCapture() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  function handleFileSelect(selected: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
  }

  function handleSubmit() {
    if (!file || processingRef.current) return;

    processingRef.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const response = await captureFn(file);
        setLastSubmittedId(response.invoice.id);
        toast.success("Nota enviada! Processando em segundo plano.", {
          action: {
            label: "Ver notas",
            onClick: () => router.push(notasHref),
          },
        });
        resetCapture();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao capturar nota.";
        setError(message);
        toast.error(message);
      } finally {
        processingRef.current = false;
      }
    });
  }

  useEffect(() => {
    return () => {
      processingRef.current = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resolvedInvoiceHref =
    invoiceHref ?? ((id: string) => `${notasHref.replace(/\/$/, "")}/${id}`);

  // Mobile variant: flex layout fills viewport; camera uses remaining height (no scroll)
  if (variant === "mobile") {
    return (
      <div className={showModeToggle ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "space-y-2"}>
        {showModeToggle ? (
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as CaptureMode)}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
          >
            <TabsList className="grid w-full shrink-0 grid-cols-2">
              <TabsTrigger value="camera">
                <Camera data-icon="inline-start" />
                Câmera
              </TabsTrigger>
              <TabsTrigger value="file">
                <FileImage data-icon="inline-start" />
                Arquivo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <CameraScannerMobile
                captureFn={captureFn}
                getInvoiceFn={getInvoiceFn}
                invoiceHref={resolvedInvoiceHref}
                layout="mobile"
              />
            </TabsContent>
            <TabsContent value="file" className="mt-0 min-h-0 overflow-y-auto">
              <FileCaptureContent
                file={file}
                previewUrl={previewUrl}
                error={error}
                isPending={isPending}
                onFileSelect={handleFileSelect}
                onSubmit={handleSubmit}
                onReset={resetCapture}
              />
              {lastSubmittedId ? (
                <div className="mt-4">
                  <CaptureStatusTracker invoiceId={lastSubmittedId} notasHref={notasHref} />
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        ) : mode === "camera" ? (
          <CameraScannerMobile
            captureFn={captureFn}
            getInvoiceFn={getInvoiceFn}
            invoiceHref={resolvedInvoiceHref}
            layout="mobile"
          />
        ) : (
          <FileCaptureContent
            file={file}
            previewUrl={previewUrl}
            error={error}
            isPending={isPending}
            onFileSelect={handleFileSelect}
            onSubmit={handleSubmit}
            onReset={resetCapture}
          />
        )}
      </div>
    );
  }

  // Default variant: Card-based layout for desktop
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{mode === "camera" ? "Escanear nota fiscal" : "Enviar nota fiscal"}</CardTitle>
          <CardDescription>
            {mode === "camera"
              ? "Aponte a câmera para a nota e toque no botão para capturar."
              : "Arraste a imagem da nota ou clique para selecionar. A extração roda em segundo plano."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showModeToggle ? (
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as CaptureMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">
                  <Camera data-icon="inline-start" />
                  Câmera
                </TabsTrigger>
                <TabsTrigger value="file">
                  <FileImage data-icon="inline-start" />
                  Arquivo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="camera" className="mt-4">
                <CameraScannerDefault
                  captureFn={captureFn}
                  getInvoiceFn={getInvoiceFn}
                  invoiceHref={resolvedInvoiceHref}
                />
              </TabsContent>
              <TabsContent value="file" className="mt-4">
                <FileCaptureContent
                  file={file}
                  previewUrl={previewUrl}
                  error={error}
                  isPending={isPending}
                  onFileSelect={handleFileSelect}
                  onSubmit={handleSubmit}
                  onReset={resetCapture}
                />
              </TabsContent>
            </Tabs>
          ) : mode === "camera" ? (
            <CameraScannerDefault
              captureFn={captureFn}
              getInvoiceFn={getInvoiceFn}
              invoiceHref={resolvedInvoiceHref}
            />
          ) : (
            <FileCaptureContent
              file={file}
              previewUrl={previewUrl}
              error={error}
              isPending={isPending}
              onFileSelect={handleFileSelect}
              onSubmit={handleSubmit}
              onReset={resetCapture}
            />
          )}
        </CardContent>
      </Card>

      {mode === "file" && lastSubmittedId ? (
        <CaptureStatusTracker invoiceId={lastSubmittedId} notasHref={notasHref} />
      ) : null}
    </div>
  );
}

function FileCaptureContent({
  file,
  previewUrl,
  error,
  isPending,
  onFileSelect,
  onSubmit,
  onReset,
}: {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  isPending: boolean;
  onFileSelect: (file: File) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <>
      {!file ? (
        <DropZone onFileSelect={onFileSelect} disabled={isPending} />
      ) : (
        <div className="space-y-4">
          {previewUrl ? <FilePreview file={file} previewUrl={previewUrl} /> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onSubmit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar nota"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onReset} disabled={isPending}>
              Escolher outra
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Erro no envio</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
