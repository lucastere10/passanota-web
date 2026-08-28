"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import {
  CategoryFilterChips,
  type CategoryFilterOption,
} from "@/components/dashboard/category-filter-chips";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSpendOverTimeByCategoryClient,
  getSpendOverTimeClient,
  getTopEmittersByCategoryClient,
  getTopEmittersClient,
} from "@/lib/api/dashboard-client";
import type {
  Breakdown,
  Granularity,
  Period,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
} from "@/lib/api/types";

const chartSkeleton = <Skeleton className="h-[280px] w-full" />;

const SpendOverTimeChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.SpendOverTimeChart),
  { loading: () => chartSkeleton, ssr: false },
);

const StackedSpendOverTimeChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.StackedSpendOverTimeChart),
  { loading: () => chartSkeleton, ssr: false },
);

const RankedBreakdownChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.RankedBreakdownChart),
  { loading: () => chartSkeleton, ssr: false },
);

const StackedEmittersChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.StackedEmittersChart),
  { loading: () => chartSkeleton, ssr: false },
);

type DashboardChartsSectionProps = {
  period: Period;
  granularity: Granularity;
  seriesRefreshing: boolean;
  spendByCategory: Breakdown;
  initialSpendOverTime: SpendOverTime;
  initialTopEmitters: Breakdown;
  initialSpendByCategoryStacked: SpendOverTimeByCategory;
  initialTopEmittersStacked: StackedBreakdown;
};

function buildCategoryOptions(breakdown: Breakdown): CategoryFilterOption[] {
  return breakdown.items.map((item) => ({
    label: item.label,
    slug: item.slug ?? null,
    percentage: item.percentage,
  }));
}

function CategoryShareHint({
  selected,
  categories,
}: {
  selected: string | null;
  categories: CategoryFilterOption[];
}) {
  if (!selected) return null;
  const cat = categories.find((c) => c.slug === selected);
  if (!cat?.percentage) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {cat.label} representa {cat.percentage.toFixed(0)}% do gasto total no período.
    </p>
  );
}

function ChartSlot({ pending, children }: { pending: boolean; children: ReactNode }) {
  if (pending) return chartSkeleton;
  return children;
}

export function DashboardChartsSection({
  period,
  granularity,
  seriesRefreshing,
  spendByCategory,
  initialSpendOverTime,
  initialTopEmitters,
  initialSpendByCategoryStacked,
  initialTopEmittersStacked,
}: DashboardChartsSectionProps) {
  const categoryOptions = buildCategoryOptions(spendByCategory);

  const [spendCategory, setSpendCategory] = useState<string | null>(null);
  const [emitterCategory, setEmitterCategory] = useState<string | null>(null);

  const [spendOverTime, setSpendOverTime] = useState(initialSpendOverTime);
  const [spendStacked, setSpendStacked] = useState(initialSpendByCategoryStacked);
  const [topEmitters, setTopEmitters] = useState(initialTopEmitters);
  const [emittersStacked, setEmittersStacked] = useState(initialTopEmittersStacked);

  const [spendPending, startSpendTransition] = useTransition();
  const [emitterPending, startEmitterTransition] = useTransition();
  const spendRequestId = useRef(0);
  const emitterRequestId = useRef(0);

  const loadSpend = useCallback(
    (categorySlug: string | null) => {
      const requestId = ++spendRequestId.current;
      startSpendTransition(async () => {
        if (categorySlug) {
          const data = await getSpendOverTimeClient(period, granularity, categorySlug);
          if (requestId !== spendRequestId.current) return;
          setSpendOverTime(data);
        } else {
          const [simple, stacked] = await Promise.all([
            getSpendOverTimeClient(period, granularity),
            getSpendOverTimeByCategoryClient(period, granularity),
          ]);
          if (requestId !== spendRequestId.current) return;
          setSpendOverTime(simple);
          setSpendStacked(stacked);
        }
      });
    },
    [period, granularity],
  );

  const loadEmitters = useCallback(
    (categorySlug: string | null) => {
      const requestId = ++emitterRequestId.current;
      startEmitterTransition(async () => {
        if (categorySlug) {
          const data = await getTopEmittersClient(period, categorySlug);
          if (requestId !== emitterRequestId.current) return;
          setTopEmitters(data);
        } else {
          const [simple, stacked] = await Promise.all([
            getTopEmittersClient(period),
            getTopEmittersByCategoryClient(period),
          ]);
          if (requestId !== emitterRequestId.current) return;
          setTopEmitters(simple);
          setEmittersStacked(stacked);
        }
      });
    },
    [period],
  );

  useEffect(() => {
    spendRequestId.current += 1;
    emitterRequestId.current += 1;
    setSpendOverTime(initialSpendOverTime);
    setSpendStacked(initialSpendByCategoryStacked);
    setTopEmitters(initialTopEmitters);
    setEmittersStacked(initialTopEmittersStacked);
    setSpendCategory(null);
    setEmitterCategory(null);
  }, [
    period,
    granularity,
    initialSpendOverTime,
    initialSpendByCategoryStacked,
    initialTopEmitters,
    initialTopEmittersStacked,
  ]);

  function handleSpendCategoryChange(slug: string | null) {
    setSpendCategory(slug);
    loadSpend(slug);
  }

  function handleEmitterCategoryChange(slug: string | null) {
    setEmitterCategory(slug);
    loadEmitters(slug);
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Gastos ao longo do tempo</CardTitle>
          <CategoryFilterChips
            categories={categoryOptions}
            selected={spendCategory}
            onChange={handleSpendCategoryChange}
          />
          <CategoryShareHint selected={spendCategory} categories={categoryOptions} />
        </CardHeader>
        <CardContent>
          <ChartSlot pending={seriesRefreshing || spendPending}>
            {spendCategory ? (
              <SpendOverTimeChart data={spendOverTime} />
            ) : (
              <StackedSpendOverTimeChart data={spendStacked} />
            )}
          </ChartSlot>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Top estabelecimentos</CardTitle>
          <CategoryFilterChips
            categories={categoryOptions}
            selected={emitterCategory}
            onChange={handleEmitterCategoryChange}
          />
          <CategoryShareHint selected={emitterCategory} categories={categoryOptions} />
        </CardHeader>
        <CardContent>
          <ChartSlot pending={seriesRefreshing || emitterPending}>
            {emitterCategory ? (
              <RankedBreakdownChart data={topEmitters} title="Top estabelecimentos" />
            ) : (
              <StackedEmittersChart data={emittersStacked} />
            )}
          </ChartSlot>
        </CardContent>
      </Card>
    </>
  );
}
