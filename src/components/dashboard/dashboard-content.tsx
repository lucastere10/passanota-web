import Link from "next/link";
import { Suspense } from "react";

import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { DashboardSecondaryCharts } from "@/components/dashboard/dashboard-secondary-charts";
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

      <DashboardSecondaryCharts
        spendByCategory={data.spendByCategory}
        topProducts={data.topProducts}
        spendOverTime={data.spendOverTime}
      />

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
