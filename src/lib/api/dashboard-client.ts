import { clientFetch } from "@/lib/api/client";
import type {
  Breakdown,
  Period,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
} from "@/lib/api/types";

export function getSpendOverTimeClient(
  period: Period,
  categorySlug?: string | null,
) {
  return clientFetch<SpendOverTime>("/v1/dashboard/spend-over-time", {
    searchParams: { period, category_slug: categorySlug ?? undefined },
  });
}

export function getSpendOverTimeByCategoryClient(period: Period) {
  return clientFetch<SpendOverTimeByCategory>("/v1/dashboard/spend-over-time-by-category", {
    searchParams: { period },
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
