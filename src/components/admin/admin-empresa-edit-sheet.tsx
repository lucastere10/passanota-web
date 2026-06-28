"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { toast } from "sonner";

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
import { clearEmpresaDataAdmin, getAdminEmpresa, updateAdminEmpresa } from "@/lib/api/auth";
import type { AdminEmpresaListItem } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type AdminEmpresaEditSheetProps = {
  empresaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (empresa: AdminEmpresaListItem) => void;
};

export function AdminEmpresaEditSheet({
  empresaId,
  open,
  onOpenChange,
  onSaved,
}: AdminEmpresaEditSheetProps) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [unlimited, setUnlimited] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState("200");
  const [readOnly, setReadOnly] = useState<AdminEmpresaListItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [confirmNome, setConfirmNome] = useState("");
  const [isClearPending, startClearTransition] = useTransition();

  useEffect(() => {
    if (!open || !empresaId) return;

    setLoading(true);
    void getAdminEmpresa(empresaId)
      .then((empresa) => {
        setReadOnly(empresa);
        setNome(empresa.nome);
        setCnpj(empresa.cnpj ?? "");
        setIsActive(empresa.is_active);
        setUnlimited(empresa.monthly_invoice_limit === null);
        setMonthlyLimit(
          empresa.monthly_invoice_limit !== null ? String(empresa.monthly_invoice_limit) : "200",
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar empresa");
        onOpenChange(false);
      })
      .finally(() => setLoading(false));
  }, [open, empresaId, onOpenChange]);

  useEffect(() => {
    if (!clearDialogOpen) {
      setConfirmNome("");
    }
  }, [clearDialogOpen]);

  function handleSave() {
    if (!empresaId) return;

    startTransition(async () => {
      try {
        const updated = await updateAdminEmpresa(empresaId, {
          nome,
          cnpj: cnpj || null,
          is_active: isActive,
          monthly_invoice_limit: unlimited ? null : Number.parseInt(monthlyLimit, 10),
        });
        onSaved(updated);
        toast.success("Empresa atualizada.");
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar empresa");
      }
    });
  }

  function handleClearData() {
    if (!empresaId || !readOnly) return;

    startClearTransition(async () => {
      try {
        const result = await clearEmpresaDataAdmin(empresaId, confirmNome);
        const refreshed = await getAdminEmpresa(empresaId);
        setReadOnly(refreshed);
        onSaved(refreshed);
        setClearDialogOpen(false);
        toast.success(
          `Dados removidos: ${result.invoices_deleted} notas, ${result.funcionarios_deleted} membros, ${result.dispositivos_deleted} dispositivos.`,
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao limpar dados da empresa");
      }
    });
  }

  const canConfirmClear = readOnly !== null && confirmNome.trim() === readOnly.nome.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar empresa</SheetTitle>
          <SheetDescription>Ajuste status, limites e dados cadastrais.</SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="py-8 text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input id="edit-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input
                id="edit-cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                maxLength={14}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border border-input"
              />
              Empresa ativa na plataforma
            </label>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={unlimited}
                  onChange={(e) => setUnlimited(e.target.checked)}
                  className="size-4 rounded border border-input"
                />
                Limite ilimitado
              </label>
              {!unlimited ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-limit">Limite mensal de notas</Label>
                  <Input
                    id="edit-limit"
                    type="number"
                    min={0}
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                  />
                </div>
              ) : null}
            </div>

            {readOnly ? (
              <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Notas (mês/total): </span>
                  {readOnly.invoices_this_month} / {readOnly.invoices_total}
                </p>
                <p>
                  <span className="text-muted-foreground">Gestor: </span>
                  {readOnly.gestor_email ?? "—"}
                  {readOnly.gestor_nome ? ` (${readOnly.gestor_nome})` : ""}
                </p>
                <p>
                  <span className="text-muted-foreground">Equipe / dispositivos: </span>
                  {readOnly.funcionarios_count} / {readOnly.dispositivos_ativos_count}
                </p>
                <p>
                  <span className="text-muted-foreground">Criada em: </span>
                  {formatDate(readOnly.created_at)}
                </p>
              </div>
            ) : null}

            <div className="space-y-3 rounded-lg border border-destructive/30 p-3">
              <div>
                <p className="text-sm font-medium text-destructive">Zona de perigo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Remove notas, equipe, convites e dispositivos. O cadastro da empresa permanece.
                </p>
              </div>
              {!readOnly?.is_active ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={loading || isClearPending}
                >
                  Limpar dados da empresa
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Suspenda a empresa antes de limpar os dados.
                </p>
              )}
            </div>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending || loading}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>

      <DialogPrimitive.Root open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150",
              "data-ending-style:opacity-0 data-starting-style:opacity-0",
              "supports-backdrop-filter:backdrop-blur-xs",
            )}
          />
          <DialogPrimitive.Popup
            className={cn(
              "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
              "rounded-lg border border-border bg-popover p-6 shadow-lg",
              "transition duration-200 ease-in-out",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            <DialogPrimitive.Title className="text-base font-semibold text-foreground">
              Limpar dados da empresa?
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              {readOnly ? (
                <>
                  Serão removidos permanentemente{" "}
                  <strong>{readOnly.invoices_total}</strong> notas,{" "}
                  <strong>{readOnly.funcionarios_count}</strong> membros da equipe e{" "}
                  <strong>{readOnly.dispositivos_ativos_count}</strong> dispositivos ativos.
                  Digite o nome exato da empresa para confirmar.
                </>
              ) : (
                "Esta ação não pode ser desfeita."
              )}
            </DialogPrimitive.Description>
            <div className="mt-4 space-y-2">
              <Label htmlFor="confirm-clear-nome">Nome da empresa</Label>
              <Input
                id="confirm-clear-nome"
                value={confirmNome}
                onChange={(e) => setConfirmNome(e.target.value)}
                placeholder={readOnly?.nome ?? ""}
                autoComplete="off"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <DialogPrimitive.Close
                render={<Button variant="outline" disabled={isClearPending} />}
              >
                Cancelar
              </DialogPrimitive.Close>
              <Button
                variant="destructive"
                disabled={!canConfirmClear || isClearPending}
                onClick={handleClearData}
              >
                {isClearPending ? "Limpando..." : "Limpar dados"}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </Sheet>
  );
}
