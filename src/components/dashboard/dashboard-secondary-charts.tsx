"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInViewOnce } from "@/hooks/use-in-view";
import type { Breakdown, Granularity, SpendOverTime, TopProducts } from "@/lib/api/types";

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
  granularity: Granularity;
  seriesRefreshing: boolean;
};

function ViewportChart({
  pending,
  heightClass,
  children,
}: {
  pending: boolean;
  heightClass: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInViewOnce();
  return (
    <div ref={ref}>
      {inView && !pending ? children : <Skeleton className={`${heightClass} w-full`} />}
    </div>
  );
}

export function DashboardSecondaryCharts({
  spendByCategory,
  topProducts,
  spendOverTime,
  granularity,
  seriesRefreshing,
}: DashboardSecondaryChartsProps) {
  const ticketTitle = granularity === "week" ? "Ticket médio por semana" : "Ticket médio por dia";

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewportChart pending={seriesRefreshing} heightClass="h-[240px]">
              <CategoryPieChart data={spendByCategory} />
            </ViewportChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewportChart pending={seriesRefreshing} heightClass="h-[240px]">
              <TopProductsChart data={topProducts} />
            </ViewportChart>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewportChart pending={seriesRefreshing} heightClass="h-[220px]">
              <InvoiceVolumeChart data={spendOverTime} />
            </ViewportChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ticketTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewportChart pending={seriesRefreshing} heightClass="h-[220px]">
              <AvgTicketChart data={spendOverTime} />
            </ViewportChart>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
