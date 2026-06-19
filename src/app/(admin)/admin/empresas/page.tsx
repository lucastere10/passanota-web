"use client";



import { useEffect, useState } from "react";

import { toast } from "sonner";



import { PageHeader } from "@/components/layout/page-header";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { createEmpresaAdmin, listEmpresasAdmin, resendGestorInvite } from "@/lib/api/auth";

import type { AdminEmpresaListItem } from "@/lib/api/types";

import { signOutClient } from "@/lib/auth/client";



export default function AdminEmpresasPage() {

  const [empresas, setEmpresas] = useState<AdminEmpresaListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");

  const [cnpj, setCnpj] = useState("");

  const [gestorEmail, setGestorEmail] = useState("");

  const [resendEmail, setResendEmail] = useState<Record<string, string>>({});



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



  async function handleResend(empresaId: string) {

    const email = resendEmail[empresaId];

    if (!email) {

      toast.error("Informe o e-mail do gestor");

      return;

    }

    try {

      await resendGestorInvite(empresaId, email);

      toast.success("Convite reenviado!");

      await loadEmpresas();

    } catch (error) {

      toast.error(error instanceof Error ? error.message : "Erro ao reenviar convite");

    }

  }



  return (

    <div className="space-y-8">

      <PageHeader

        title="Empresas"

        description="Gerencie empresas e convites de gestores"

        actions={

          <Button variant="outline" onClick={() => void signOutClient()}>

            Sair

          </Button>

        }

      />



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

                <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={14} />

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

            <Button type="submit" disabled={submitting}>

              {submitting ? "Criando..." : "Criar empresa e convidar gestor"}

            </Button>

          </form>

        </CardContent>

      </Card>



      <div className="space-y-4">

        <h2 className="text-base font-semibold tracking-[-0.02em]">Empresas cadastradas</h2>

        {loading ? (

          <p className="text-sm text-muted-foreground">Carregando...</p>

        ) : empresas.length === 0 ? (

          <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>

        ) : (

          <Card>

            <CardContent className="divide-y divide-border p-0">

              {empresas.map((empresa) => (

                <div

                  key={empresa.id}

                  className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"

                >

                  <div>

                    <p className="font-medium">{empresa.nome}</p>

                    {empresa.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {empresa.cnpj}</p>}

                    {empresa.gestor_convite_pendente && (

                      <Badge variant="secondary" className="mt-1">

                        Convite gestor pendente

                      </Badge>

                    )}

                  </div>

                  <div className="flex gap-2">

                    <Input

                      type="email"

                      placeholder="E-mail do gestor"

                      value={resendEmail[empresa.id] ?? ""}

                      onChange={(e) =>

                        setResendEmail((prev) => ({ ...prev, [empresa.id]: e.target.value }))

                      }

                      className="max-w-xs"

                    />

                    <Button variant="outline" onClick={() => void handleResend(empresa.id)}>

                      Reenviar convite

                    </Button>

                  </div>

                </div>

              ))}

            </CardContent>

          </Card>

        )}

      </div>

    </div>

  );

}

