"use client";

import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/invoices/status-badge";
import { ConfidenceBadge } from "@/components/invoices/confidence-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CaptureInvoiceResponse } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ExtractionResultsProps = {
  result: CaptureInvoiceResponse;
};

export function ExtractionResults({ result }: ExtractionResultsProps) {
  const { invoice, processed_image_url, extraction_summary, preprocess_skipped } = result;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {extraction_summary.fornecedor ??
              invoice.emitter?.trade_name ??
              invoice.emitter?.legal_name ??
              "Fornecedor não identificado"}
          </p>
          <p className="text-sm text-muted-foreground">
            {extraction_summary.data
              ? formatDateTime(`${extraction_summary.data}T12:00:00Z`)
              : formatDateTime(invoice.issued_at)}{" "}
            · {extraction_summary.item_count} itens
            {preprocess_skipped ? " · pré-processamento simplificado" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.status} />
          {invoice.ai_confidence ? (
            <ConfidenceBadge value={invoice.ai_confidence} />
          ) : null}
        </div>
      </div>

      {processed_image_url ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <Image
            src={processed_image_url}
            alt="Nota processada"
            width={800}
            height={600}
            unoptimized
            className="max-h-64 w-full object-contain"
          />
        </div>
      ) : null}

      {invoice.items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category_name ?? "Outros"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.total_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link href={`/notas/${invoice.id}`} className={cn(buttonVariants())}>
          Ver detalhes
        </Link>
        {invoice.status === "parsed" ? (
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
            Ir ao dashboard
          </Link>
        ) : null}
      </div>

      {invoice.error_message ? (
        <p className="text-sm text-destructive">{invoice.error_message}</p>
      ) : null}
    </div>
  );
}
