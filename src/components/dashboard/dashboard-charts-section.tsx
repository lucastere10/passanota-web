"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import {
  CategoryFilterChips,
  type CategoryFilterOption,
} from "@/components/dashboard/category-filter-chips";
import {
  RankedBreakdownChart,
  SpendOverTimeChart,
  StackedEmittersChart,
  StackedSpendOverTimeChart,
} from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSpendOverTimeByCategoryClient,
  getSpendOverTimeClient,
  getTopEmittersByCategoryClient,
  getTopEmittersClient,
} from "@/lib/api/dashboard-client";
import type {
  Breakdown,
  Period,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
} from "@/lib/api/types";

type DashboardChartsSectionProps = {
  period: Period;
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

export function DashboardChartsSection({
  period,
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

  const [isPending, startTransition] = useTransition();

  const loadSpend = useCallback(
    (categorySlug: string | null) => {
      startTransition(async () => {
        if (categorySlug) {
          const data = await getSpendOverTimeClient(period, categorySlug);
          setSpendOverTime(data);
        } else {
          const [simple, stacked] = await Promise.all([
            getSpendOverTimeClient(period),
            getSpendOverTimeByCategoryClient(period),
          ]);
          setSpendOverTime(simple);
          setSpendStacked(stacked);
        }
      });
    },
    [period],
  );

  const loadEmitters = useCallback(
    (categorySlug: string | null) => {
      startTransition(async () => {
        if (categorySlug) {
          const data = await getTopEmittersClient(period, categorySlug);
          setTopEmitters(data);
        } else {
          const [simple, stacked] = await Promise.all([
            getTopEmittersClient(period),
            getTopEmittersByCategoryClient(period),
          ]);
          setTopEmitters(simple);
          setEmittersStacked(stacked);
        }
      });
    },
    [period],
  );

  useEffect(() => {
    setSpendOverTime(initialSpendOverTime);
    setSpendStacked(initialSpendByCategoryStacked);
    setTopEmitters(initialTopEmitters);
    setEmittersStacked(initialTopEmittersStacked);
    setSpendCategory(null);
    setEmitterCategory(null);
  }, [
    period,
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
        <CardContent className={isPending ? "opacity-60 transition-opacity" : undefined}>
          {spendCategory ? (
            <SpendOverTimeChart data={spendOverTime} />
          ) : (
            <StackedSpendOverTimeChart data={spendStacked} />
          )}
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
        <CardContent className={isPending ? "opacity-60 transition-opacity" : undefined}>
          {emitterCategory ? (
            <RankedBreakdownChart data={topEmitters} title="Top estabelecimentos" />
          ) : (
            <StackedEmittersChart data={emittersStacked} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
