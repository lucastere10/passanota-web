import Link from "next/link";
import { Suspense } from "react";

import { PeriodSelector } from "@/components/dashboard/period-selector";
import { BreakdownList, SpendOverTimeChart } from "@/components/dashboard/charts";
import { RecentInvoicesTable, SummaryCards } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/api/server";
import type { Period } from "@/lib/api/types";
import { PERIOD_LABELS } from "@/lib/format";

export async function DashboardContent({ period }: { period: Period }) {
  const data = await getDashboardData(period);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Visão de gastos — ${PERIOD_LABELS[period] ?? period}`}
        actions={
          <Suspense fallback={<div className="h-9 w-48 animate-pulse rounded-md bg-muted" />}>
            <PeriodSelector current={period} />
          </Suspense>
        }
      />

      <SummaryCards summary={data.summary} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos ao longo do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendOverTimeChart data={data.spendOverTime} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top estabelecimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList title="Top estabelecimentos" data={data.topEmitters} variant="bar" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList title="Categorias" data={data.spendByCategory} variant="pie" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Notas recentes</CardTitle>
          <Link href="/notas" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <RecentInvoicesTable invoices={data.recent.data} />
        </CardContent>
      </Card>
    </div>
  );
}
