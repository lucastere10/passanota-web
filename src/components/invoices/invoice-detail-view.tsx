"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CopyAccessKey } from "@/components/invoices/copy-access-key";
import { InvoiceEditSheet } from "@/components/invoices/invoice-edit-sheet";
import { StatusBadge } from "@/components/invoices/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteInvoiceClient,
  deleteInvoiceItemClient,
  getInvoiceClient,
  updateInvoiceItemClient,
} from "@/lib/api/client";
import type { Invoice, InvoiceItem } from "@/lib/api/types";
import {
  formatAccessKey,
  formatCnpj,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/format";

type ItemDraft = {
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  total_price: string;
};

function itemToDraft(item: InvoiceItem): ItemDraft {
  return {
    description: item.description,
    quantity: item.quantity ?? "",
    unit: item.unit ?? "",
    unit_price: item.unit_price ?? "",
    total_price: item.total_price ?? "",
  };
}

export function InvoiceDetailView({ initialInvoice }: { initialInvoice: Invoice }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteInvoiceClient(invoice.id);
        toast.success("Nota excluída.");
        router.push("/notas");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir nota.");
      }
    });
  }

  function startEditItem(item: InvoiceItem) {
    setEditingItemId(item.id);
    setItemDraft(itemToDraft(item));
  }

  function cancelEditItem() {
    setEditingItemId(null);
    setItemDraft(null);
  }

  function saveItem(itemId: string) {
    if (!itemDraft) return;

    startTransition(async () => {
      try {
        await updateInvoiceItemClient(invoice.id, itemId, itemDraft);
        const updated = await getInvoiceClient(invoice.id);
        setInvoice(updated);
        cancelEditItem();
        toast.success("Item atualizado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar item.");
      }
    });
  }

  function handleDeleteItem(itemId: string) {
    if (!window.confirm("Excluir este item?")) return;

    startTransition(async () => {
      try {
        await deleteInvoiceItemClient(invoice.id, itemId);
        const updated = await getInvoiceClient(invoice.id);
        setInvoice(updated);
        toast.success("Item excluído.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir item.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{emitterName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro: {formatDate(invoice.created_at)}
            {invoice.issued_at ? ` · Emissão: ${formatDate(invoice.issued_at)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={invoice.status} />
          {invoice.status !== "pending" ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Excluir
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {confirmDelete ? (
        <Alert variant="destructive">
          <AlertTitle>Excluir nota fiscal?</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                Confirmar exclusão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

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
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => {
                    const isEditing = editingItemId === item.id;

                    if (isEditing && itemDraft) {
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              value={itemDraft.description}
                              onChange={(e) =>
                                setItemDraft({ ...itemDraft, description: e.target.value })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={itemDraft.quantity}
                              onChange={(e) =>
                                setItemDraft({ ...itemDraft, quantity: e.target.value })
                              }
                              className="h-8 w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={itemDraft.unit}
                              onChange={(e) =>
                                setItemDraft({ ...itemDraft, unit: e.target.value })
                              }
                              className="h-8 w-14"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={itemDraft.unit_price}
                              onChange={(e) =>
                                setItemDraft({ ...itemDraft, unit_price: e.target.value })
                              }
                              className="h-8 w-24 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={itemDraft.total_price}
                              onChange={(e) =>
                                setItemDraft({ ...itemDraft, total_price: e.target.value })
                              }
                              className="h-8 w-24 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => saveItem(item.id)}
                                disabled={isPending}
                              >
                                Salvar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditItem}
                                disabled={isPending}
                              >
                                ✕
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
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
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => startEditItem(item)}
                              disabled={isPending}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                <div>
                  <p className="text-muted-foreground">Registro na plataforma</p>
                  <p>{formatDateTime(invoice.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de emissão</p>
                  <p>{formatDate(invoice.issued_at)}</p>
                </div>
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

      <InvoiceEditSheet
        invoice={invoice}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={setInvoice}
      />
    </div>
  );
}
