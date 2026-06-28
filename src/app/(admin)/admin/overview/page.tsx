"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOverview } from "@/lib/api/auth";
import type { AdminPlatformOverview } from "@/lib/api/types";
import { signOutClient } from "@/lib/auth/client";

function StatCard({ title, value, hint }: { title: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString("pt-BR")}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminPlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAdminOverview()
      .then(setOverview)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar visão geral");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visão geral"
        description="Métricas da plataforma PassaNota"
        actions={
          <Button variant="outline" onClick={() => void signOutClient()}>
            Sair
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Empresas ativas"
              value={overview.empresas_active}
              hint={`${overview.empresas_inactive} suspensa(s)`}
            />
            <StatCard
              title="Notas este mês"
              value={overview.invoices_this_month}
              hint={`${overview.invoices_total} no total`}
            />
            <StatCard title="Gestores ativos" value={overview.gestores_active} />
            <StatCard title="Operadores ativos" value={overview.operadores_active} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Admins plataforma" value={overview.platform_admins} />
            <StatCard title="Dispositivos ativos" value={overview.devices_active} />
            <StatCard
              title="Convites pendentes"
              value={overview.convites_pendentes_gestor + overview.convites_pendentes_operador}
              hint={`${overview.convites_pendentes_gestor} gestor · ${overview.convites_pendentes_operador} operador`}
            />
            <StatCard title="Funcionários inativos" value={overview.funcionarios_inactive} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top empresas no mês</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.top_empresas_month.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma nota registrada este mês.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.top_empresas_month.map((item) => (
                      <TableRow key={item.nome}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.invoices_this_month}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
