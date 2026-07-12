"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateInvoiceClient } from "@/lib/api/client";
import type { Invoice } from "@/lib/api/types";

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch {
    return "";
  }
}

type InvoiceEditSheetProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (invoice: Invoice) => void;
};

export function InvoiceEditSheet({
  invoice,
  open,
  onOpenChange,
  onSaved,
}: InvoiceEditSheetProps) {
  const [emitterName, setEmitterName] = useState(
    invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "",
  );
  const [issuedAt, setIssuedAt] = useState(toDateInputValue(invoice.issued_at));
  const [totalAmount, setTotalAmount] = useState(invoice.total_amount ?? "");
  const [discountAmount, setDiscountAmount] = useState(invoice.discount_amount ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (next) {
      setEmitterName(invoice.emitter?.trade_name ?? invoice.emitter?.legal_name ?? "");
      setIssuedAt(toDateInputValue(invoice.issued_at));
      setTotalAmount(invoice.total_amount ?? "");
      setDiscountAmount(invoice.discount_amount ?? "");
      setError(null);
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const updated = await updateInvoiceClient(invoice.id, {
          emitter_name: emitterName || null,
          issued_at: issuedAt ? new Date(`${issuedAt}T12:00:00`).toISOString() : null,
          total_amount: totalAmount || null,
          discount_amount: discountAmount || null,
        });
        onSaved(updated);
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar nota.");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Editar nota</SheetTitle>
            <SheetDescription>Ajuste os dados da nota fiscal.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto py-6">
            <div className="space-y-2">
              <Label htmlFor="emitter_name">Emitente</Label>
              <Input
                id="emitter_name"
                value={emitterName}
                onChange={(e) => setEmitterName(e.target.value)}
                placeholder="Nome do emitente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued_at">Data de emissão</Label>
              <Input
                id="issued_at"
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total</Label>
              <Input
                id="total_amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Desconto</Label>
              <Input
                id="discount_amount"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
