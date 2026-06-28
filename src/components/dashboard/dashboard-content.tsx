import Link from "next/link";
import { Suspense } from "react";

import {
  AvgTicketChart,
  CategoryPieChart,
  InvoiceVolumeChart,
  TopProductsChart,
} from "@/components/dashboard/charts";
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { PeriodSelector } from "@/components/dashboard/period-selector";
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

      <DashboardChartsSection
        period={period}
        spendByCategory={data.spendByCategory}
        initialSpendOverTime={data.spendOverTime}
        initialTopEmitters={data.topEmitters}
        initialSpendByCategoryStacked={data.spendByCategoryStacked}
        initialTopEmittersStacked={data.topEmittersStacked}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={data.spendByCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={data.topProducts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de notas</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceVolumeChart data={data.spendOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket médio por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <AvgTicketChart data={data.spendOverTime} />
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
