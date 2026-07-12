"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { StatusBadge } from "@/components/invoices/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInvoiceClient } from "@/lib/api/client";
import type { Invoice } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CaptureStatusTrackerProps = {
  invoiceId: string;
  notasHref?: string;
};

export function CaptureStatusTracker({
  invoiceId,
  notasHref = "/notas",
}: CaptureStatusTrackerProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getInvoiceClient(invoiceId);
        if (cancelled) return;
        setInvoice(data);
        setPollError(null);
        return data.status;
      } catch (err) {
        if (!cancelled) {
          setPollError(err instanceof Error ? err.message : "Erro ao consultar status.");
        }
        return null;
      }
    }

    void poll();
    const intervalId = window.setInterval(async () => {
      const status = await poll();
      if (status && status !== "pending") {
        window.clearInterval(intervalId);
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [invoiceId]);

  const status = invoice?.status ?? "pending";

  return (
    <Card className="border-primary/20">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Processamento da nota</p>
            <p className="font-mono text-xs text-muted-foreground">{invoiceId}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {status === "pending" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Analisando imagem com IA… isso pode levar até um minuto.
          </div>
        ) : null}

        {status === "parsed" ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Nota processada</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {invoice?.items.length ?? 0} itens extraídos
                {invoice?.total_amount
                  ? ` · Total ${formatCurrency(invoice.total_amount)}`
                  : ""}
              </p>
              <Link
                href={`/notas/${invoiceId}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver detalhes
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {status === "failed" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Falha no processamento</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{invoice?.error_message ?? "Erro desconhecido durante a extração."}</p>
              <Link
                href={`/notas/${invoiceId}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver nota
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {pollError ? (
          <p className="text-sm text-destructive">
            Não foi possível atualizar o status: {pollError}
          </p>
        ) : null}

        <Link
          href={notasHref}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Ir para lista de notas
        </Link>
      </CardContent>
    </Card>
  );
}
