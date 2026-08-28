import { clientFetch } from "@/lib/api/client";
import type {
  Breakdown,
  DashboardAllResponse,
  DashboardSummary,
  Granularity,
  Period,
  RecentInvoices,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
  TopProducts,
} from "@/lib/api/types";

export type DashboardData = {
  summary: DashboardSummary;
  spendOverTime: SpendOverTime;
  spendByCategoryStacked: SpendOverTimeByCategory;
  topEmitters: Breakdown;
  topEmittersStacked: StackedBreakdown;
  spendByCategory: Breakdown;
  topProducts: TopProducts;
  recent: RecentInvoices;
};

export async function getDashboardAllClient(period: Period, granularity: Granularity) {
  const data = await clientFetch<DashboardAllResponse>("/v1/dashboard", {
    searchParams: { period, granularity },
  });
  return {
    summary: data.summary,
    spendOverTime: data.spend_over_time,
    spendByCategoryStacked: data.spend_by_category_stacked,
    topEmitters: data.top_emitters,
    topEmittersStacked: data.top_emitters_stacked,
    spendByCategory: data.spend_by_category,
    topProducts: data.top_products,
    recent: data.recent,
  } satisfies DashboardData;
}

export function getSpendOverTimeClient(
  period: Period,
  granularity: Granularity,
  categorySlug?: string | null,
) {
  return clientFetch<SpendOverTime>("/v1/dashboard/spend-over-time", {
    searchParams: { period, granularity, category_slug: categorySlug ?? undefined },
  });
}

export function getSpendOverTimeByCategoryClient(period: Period, granularity: Granularity) {
  return clientFetch<SpendOverTimeByCategory>("/v1/dashboard/spend-over-time-by-category", {
    searchParams: { period, granularity },
  });
}

export function getTopEmittersClient(period: Period, categorySlug?: string | null) {
  return clientFetch<Breakdown>("/v1/dashboard/top-emitters", {
    searchParams: { period, limit: 10, category_slug: categorySlug ?? undefined },
  });
}

export function getTopEmittersByCategoryClient(period: Period) {
  return clientFetch<StackedBreakdown>("/v1/dashboard/top-emitters-by-category", {
    searchParams: { period, limit: 10 },
  });
}
