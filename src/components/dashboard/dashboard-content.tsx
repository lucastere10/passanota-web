import Link from "next/link";

import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { DashboardSecondaryCharts } from "@/components/dashboard/dashboard-secondary-charts";
import { RecentInvoicesTable, SummaryCards } from "@/components/dashboard/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/api/dashboard-client";
import type { Granularity, Period } from "@/lib/api/types";

export function DashboardContent({
  period,
  granularity,
  data,
  seriesRefreshing,
}: {
  period: Period;
  granularity: Granularity;
  data: DashboardData;
  seriesRefreshing: boolean;
}) {
  return (
    <>
      <SummaryCards summary={data.summary} />

      <DashboardChartsSection
        period={period}
        granularity={granularity}
        seriesRefreshing={seriesRefreshing}
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
        granularity={granularity}
        seriesRefreshing={seriesRefreshing}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Notas recentes</CardTitle>
          <Link href="/notas" className="text-sm text-primary hover:underline" prefetch={false}>
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <RecentInvoicesTable invoices={data.recent.data} />
        </CardContent>
      </Card>
    </>
  );
}
