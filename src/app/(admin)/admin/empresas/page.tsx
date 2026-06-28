"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminEmpresaEditSheet } from "@/components/admin/admin-empresa-edit-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createEmpresaAdmin,
  listEmpresasAdmin,
  resendGestorInvite,
  updateAdminEmpresa,
} from "@/lib/api/auth";
import type { AdminEmpresaListItem } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatLimit(limit: number | null) {
  return limit === null ? "Ilimitado" : String(limit);
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<AdminEmpresaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [gestorEmail, setGestorEmail] = useState("");
  const [editEmpresaId, setEditEmpresaId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function loadEmpresas() {
    try {
      const data = await listEmpresasAdmin();
      setEmpresas(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmpresas();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEmpresaAdmin({
        nome,
        cnpj: cnpj || undefined,
        gestor_email: gestorEmail,
      });
      toast.success("Empresa criada e convite enviado!");
      setNome("");
      setCnpj("");
      setGestorEmail("");
      await loadEmpresas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar empresa");
    } finally {
      setSubmitting(false);
    }
  }

  function handleResend(empresa: AdminEmpresaListItem) {
    const email = empresa.gestor_email;
    if (!email) {
      toast.error("Empresa sem e-mail de gestor cadastrado");
      return;
    }
    startTransition(async () => {
      try {
        await resendGestorInvite(empresa.id, email);
        toast.success("Convite reenviado!");
        await loadEmpresas();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao reenviar convite");
      }
    });
  }

  function toggleActive(empresa: AdminEmpresaListItem) {
    const nextActive = !empresa.is_active;
    const message = nextActive
      ? "Restaurar acesso desta empresa?"
      : "Suspender esta empresa? Dispositivos serão revogados.";

    if (!window.confirm(message)) return;

    startTransition(async () => {
      try {
        const updated = await updateAdminEmpresa(empresa.id, { is_active: nextActive });
        setEmpresas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success(nextActive ? "Empresa reativada." : "Empresa suspensa.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
      }
    });
  }

  function openEdit(empresaId: string) {
    setEditEmpresaId(empresaId);
    setEditOpen(true);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Empresas" description="Gerencie empresas, gestores e limites de uso" />

      <Card>
        <CardHeader>
          <CardTitle>Nova empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da empresa</Label>
                <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  maxLength={14}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gestor_email">E-mail do gestor</Label>
                <Input
                  id="gestor_email"
                  type="email"
                  required
                  value={gestorEmail}
                  onChange={(e) => setGestorEmail(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Novas empresas recebem limite padrão de 200 notas por mês.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar empresa e convidar gestor"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresas cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Carregando...</p>
          ) : empresas.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>
                      <p className="font-medium">{empresa.nome}</p>
                      {empresa.cnpj ? (
                        <p className="text-xs text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Desde {formatDate(empresa.created_at)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{empresa.gestor_email ?? "—"}</p>
                      {empresa.gestor_nome ? (
                        <p className="text-xs text-muted-foreground">{empresa.gestor_nome}</p>
                      ) : null}
                      {empresa.gestor_convite_pendente ? (
                        <Badge variant="secondary" className="mt-1">
                          Convite pendente
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          empresa.is_active
                            ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                            : "border-destructive/30 bg-destructive/10 text-destructive",
                        )}
                      >
                        {empresa.is_active ? "Ativa" : "Suspensa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {empresa.invoices_this_month} / {empresa.invoices_total}
                      <p className="text-xs text-muted-foreground">mês / total</p>
                    </TableCell>
                    <TableCell className="text-sm">{formatLimit(empresa.monthly_invoice_limit)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(empresa.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || !empresa.gestor_email}
                          onClick={() => handleResend(empresa)}
                        >
                          Reenviar
                        </Button>
                        <Button
                          size="sm"
                          variant={empresa.is_active ? "destructive" : "default"}
                          disabled={isPending}
                          onClick={() => toggleActive(empresa)}
                        >
                          {empresa.is_active ? "Suspender" : "Reativar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdminEmpresaEditSheet
        empresaId={editEmpresaId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => {
          setEmpresas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }}
      />
    </div>
  );
}
