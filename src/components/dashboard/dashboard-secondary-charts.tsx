"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Breakdown, SpendOverTime, TopProducts } from "@/lib/api/types";

const chartSkeleton = (className: string) => <Skeleton className={className} />;

const CategoryPieChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.CategoryPieChart),
  { loading: () => chartSkeleton("h-[240px] w-full"), ssr: false },
);

const TopProductsChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.TopProductsChart),
  { loading: () => chartSkeleton("h-[240px] w-full"), ssr: false },
);

const InvoiceVolumeChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.InvoiceVolumeChart),
  { loading: () => chartSkeleton("h-[220px] w-full"), ssr: false },
);

const AvgTicketChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.AvgTicketChart),
  { loading: () => chartSkeleton("h-[220px] w-full"), ssr: false },
);

type DashboardSecondaryChartsProps = {
  spendByCategory: Breakdown;
  topProducts: TopProducts;
  spendOverTime: SpendOverTime;
};

export function DashboardSecondaryCharts({
  spendByCategory,
  topProducts,
  spendOverTime,
}: DashboardSecondaryChartsProps) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={spendByCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProducts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de notas</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceVolumeChart data={spendOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket médio por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <AvgTicketChart data={spendOverTime} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
