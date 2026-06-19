"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { ExtractionResults } from "@/components/scan/extraction-results";
import { ImagePreview } from "@/components/scan/image-preview";
import { PhotoCapture } from "@/components/scan/photo-capture";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureInvoiceClient } from "@/lib/api/client";
import type { CaptureInvoiceResponse } from "@/lib/api/types";

type Step = "capture" | "preview" | "done";

type ScanPanelProps = {
  captureFn?: (file: File) => Promise<CaptureInvoiceResponse>;
};

export function ScanPanel({ captureFn = captureInvoiceClient }: ScanPanelProps) {
  const [step, setStep] = useState<Step>("capture");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CaptureInvoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const processingRef = useRef(false);

  function resetCapture() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStep("capture");
  }

  function handleCapture(captured: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(captured);
    setPreviewUrl(URL.createObjectURL(captured));
    setResult(null);
    setError(null);
    setStep("preview");
  }

  function handleSubmit() {
    if (!file || processingRef.current) return;

    processingRef.current = true;
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await captureFn(file);
        setResult(response);
        setStep("done");
        if (response.invoice.status === "parsed") {
          toast.success("Nota registrada com sucesso.");
        } else {
          toast.error(response.invoice.error_message ?? "Falha ao processar a nota.");
        }
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
          {step === "done" ? (
            <button
              type="button"
              onClick={resetCapture}
              className="text-sm font-medium text-primary hover:underline"
            >
              Capturar outra nota
            </button>
          ) : null}
          {isPending ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Processando imagem e extraindo dados com IA...
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>Dados extraídos e normalizados da nota.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {!error && !result && !isPending ? (
            <p className="text-sm text-muted-foreground">
              O resultado da extração aparecerá aqui após o envio.
            </p>
          ) : null}
          {result ? <ExtractionResults result={result} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
