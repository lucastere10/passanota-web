import type { Granularity, Period } from "@/lib/api/types";

export const DASHBOARD_PERIODS: Period[] = ["7d", "30d", "90d"];

export function parsePeriod(value: string | null): Period {
  if (value === "7d" || value === "30d" || value === "90d") return value;
  return "30d";
}

export function defaultGranularity(period: Period): Granularity {
  return period === "7d" ? "day" : "week";
}

export function parseGranularity(period: Period, value: string | null): Granularity {
  if (period === "7d") return "day";
  if (value === "day" || value === "week") return value;
  return "week";
}

export function granularityForPeriodChange(
  nextPeriod: Period,
  prevPeriod: Period,
  prevGranularity: Granularity,
): Granularity {
  if (nextPeriod === "7d") return "day";
  if (prevPeriod === "7d") return "week";
  return prevGranularity;
}
