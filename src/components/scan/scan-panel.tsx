"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { ImagePreview } from "@/components/scan/image-preview";
import { PhotoCapture } from "@/components/scan/photo-capture";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureInvoiceClient } from "@/lib/api/client";
import type { CaptureInvoiceResponse } from "@/lib/api/types";

type Step = "capture" | "preview";

type ScanPanelProps = {
  captureFn?: (file: File) => Promise<CaptureInvoiceResponse>;
  notasHref?: string;
};

export function ScanPanel({
  captureFn = captureInvoiceClient,
  notasHref = "/notas",
}: ScanPanelProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("capture");
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
    setStep("capture");
  }

  function handleCapture(captured: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(captured);
    setPreviewUrl(URL.createObjectURL(captured));
    setError(null);
    setStep("preview");
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Captura</CardTitle>
          <CardDescription>
            Tire uma foto da nota fiscal ou envie uma imagem do dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "capture" ? (
            <PhotoCapture onCapture={handleCapture} disabled={isPending} />
          ) : null}
          {step === "preview" && file && previewUrl ? (
            <ImagePreview
              file={file}
              previewUrl={previewUrl}
              onRetake={resetCapture}
              onSubmit={handleSubmit}
              disabled={isPending}
            />
          ) : null}
          {isPending ? (
            <p className="mt-4 text-sm text-muted-foreground">Enviando imagem...</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processamento</CardTitle>
          <CardDescription>
            A nota é analisada em segundo plano. Você pode continuar capturando ou acompanhar em
            Notas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {!error && !lastSubmittedId ? (
            <p className="text-sm text-muted-foreground">
              Após o envio, a extração com IA roda em background. O status aparece na lista de
              notas.
            </p>
          ) : null}
          {lastSubmittedId ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Última nota enviada está sendo processada.
              </p>
              <Button variant="outline" size="sm" onClick={() => router.push(notasHref)}>
                Ver notas
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
