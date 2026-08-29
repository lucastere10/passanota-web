"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { PageHeader } from "@/components/layout/page-header";
import { useEmpresa } from "@/components/providers/empresa-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardAllClient } from "@/lib/api/dashboard-client";
import { parseGranularity, parsePeriod } from "@/lib/dashboard/period";
import { PERIOD_LABELS } from "@/lib/format";

function SummaryIslandSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

function ChartIslandSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos ao longo do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top estabelecimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function SecondaryIslandSkeleton() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[220px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket médio</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[220px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RecentIslandSkeleton() {
  return <Skeleton className="h-48 rounded-lg" />;
}

export function DashboardView() {
  const searchParams = useSearchParams();
  const { selectedEmpresaId } = useEmpresa();
  const period = parsePeriod(searchParams.get("period"));
  const granularity = parseGranularity(period, searchParams.get("granularity"));

  const { data, error, isLoading, isValidating } = useSWR(
    selectedEmpresaId ? (["dashboard-all", selectedEmpresaId, period, granularity] as const) : null,
    ([, , nextPeriod, nextGranularity]) => getDashboardAllClient(nextPeriod, nextGranularity),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  const seriesRefreshing = Boolean(data) && isValidating && !isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Visão de gastos — ${PERIOD_LABELS[period] ?? period}`}
        actions={<PeriodSelector period={period} granularity={granularity} />}
      />

      {error && !data ? (
        <p className="text-sm text-destructive">Não foi possível carregar o dashboard.</p>
      ) : null}

      {!data ? (
        <>
          <SummaryIslandSkeleton />
          <ChartIslandSkeleton />
          <SecondaryIslandSkeleton />
          <RecentIslandSkeleton />
        </>
      ) : (
        <DashboardContent
          period={period}
          granularity={granularity}
          data={data}
          seriesRefreshing={seriesRefreshing}
        />
      )}
    </div>
  );
}
