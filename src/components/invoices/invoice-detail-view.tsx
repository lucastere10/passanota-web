"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CopyAccessKey } from "@/components/invoices/copy-access-key";
import { StatusBadge } from "@/components/invoices/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoiceClient } from "@/lib/api/client";
import type { Invoice } from "@/lib/api/types";
import {
  formatAccessKey,
  formatCnpj,
  formatCurrency,
  formatDateTime,
} from "@/lib/format";

export function InvoiceDetailView({ initialInvoice }: { initialInvoice: Invoice }) {
  const [invoice, setInvoice] = useState(initialInvoice);

  useEffect(() => {
    setInvoice(initialInvoice);
  }, [initialInvoice]);

  useEffect(() => {
    if (invoice.status !== "pending") return;

    const intervalId = window.setInterval(async () => {
      try {
        const updated = await getInvoiceClient(invoice.id);
        setInvoice(updated);
      } catch {
        // keep polling on transient errors
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [invoice.id, invoice.status]);

  const emitterName =
    invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "Nota fiscal";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{emitterName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoice.source_type === "photo_ai" ? "Foto + IA" : "Nota fiscal"}
            {invoice.uf ? ` · ${invoice.uf}` : ""}
            {invoice.issued_at ? ` · ${formatDateTime(invoice.issued_at)}` : ""}
          </p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {invoice.status === "pending" ? (
        <Alert>
          <AlertTitle>Processando nota</AlertTitle>
          <AlertDescription>
            A imagem está sendo analisada em segundo plano. Esta página atualiza automaticamente.
          </AlertDescription>
        </Alert>
      ) : null}

      {invoice.status === "failed" && invoice.error_message ? (
        <Alert variant="destructive">
          <AlertTitle>Falha no processamento</AlertTitle>
          <AlertDescription>{invoice.error_message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Itens</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.status === "pending" ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : invoice.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item disponível.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Un</TableHead>
                    <TableHead className="text-right">Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="font-mono">{item.quantity ?? "—"}</TableCell>
                      <TableCell>{item.unit ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {invoice.status === "pending" ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ) : (
              <>
                {invoice.emitter?.cnpj ? (
                  <div>
                    <p className="text-muted-foreground">CNPJ</p>
                    <p className="font-mono">{formatCnpj(invoice.emitter.cnpj)}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-mono text-lg font-semibold">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
                {(invoice.series || invoice.number) && (
                  <div>
                    <p className="text-muted-foreground">Série / Número</p>
                    <p>
                      {invoice.series ?? "—"} / {invoice.number ?? "—"}
                    </p>
                  </div>
                )}
                {invoice.ai_model ? (
                  <div>
                    <p className="text-muted-foreground">Modelo IA</p>
                    <p>{invoice.ai_model}</p>
                  </div>
                ) : null}
                {invoice.access_key ? (
                  <div>
                    <p className="text-muted-foreground">Chave de acesso</p>
                    <p className="font-mono text-xs leading-relaxed">
                      {formatAccessKey(invoice.access_key)}
                    </p>
                    <CopyAccessKey value={invoice.access_key} />
                  </div>
                ) : null}
              </>
            )}
            <Link href="/notas" className="inline-block text-sm font-medium text-primary hover:underline">
              Voltar para notas
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
