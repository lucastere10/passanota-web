"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DropZone, FilePreview } from "@/components/scan/drop-zone";
import { CaptureStatusTracker } from "@/components/scan/capture-status-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureInvoiceClient } from "@/lib/api/client";
import type { CaptureInvoiceResponse } from "@/lib/api/types";

type ScanPanelProps = {
  captureFn?: (file: File) => Promise<CaptureInvoiceResponse>;
  notasHref?: string;
};

export function ScanPanel({
  captureFn = captureInvoiceClient,
  notasHref = "/notas",
}: ScanPanelProps) {
  const router = useRouter();
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Enviar nota fiscal</CardTitle>
          <CardDescription>
            Arraste a imagem da nota ou clique para selecionar. A extração roda em segundo plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <DropZone onFileSelect={handleFileSelect} disabled={isPending} />
          ) : (
            <div className="space-y-4">
              {previewUrl ? <FilePreview file={file} previewUrl={previewUrl} /> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar nota"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetCapture}
                  disabled={isPending}
                >
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
        </CardContent>
      </Card>

      {lastSubmittedId ? (
        <CaptureStatusTracker invoiceId={lastSubmittedId} notasHref={notasHref} />
      ) : null}
    </div>
  );
}
