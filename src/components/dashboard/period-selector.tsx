"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Granularity, Period } from "@/lib/api/types";
import { DASHBOARD_PERIODS, granularityForPeriodChange } from "@/lib/dashboard/period";

const PERIOD_CHIP_LABELS: Record<Period, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
};

export function PeriodSelector({
  period,
  granularity,
}: {
  period: Period;
  granularity: Granularity;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function replace(nextPeriod: Period, nextGranularity: Granularity) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", nextPeriod);
    if (nextPeriod === "7d") {
      params.delete("granularity");
    } else {
      params.set("granularity", nextGranularity);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handlePeriod(nextPeriod: Period) {
    replace(nextPeriod, granularityForPeriodChange(nextPeriod, period, granularity));
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end" aria-busy={isPending}>
      <div className="flex flex-wrap gap-2">
        {DASHBOARD_PERIODS.map((item) => {
          const active = period === item;
          return (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              onClick={() => handlePeriod(item)}
            >
              {PERIOD_CHIP_LABELS[item]}
            </Button>
          );
        })}
      </div>
      {period !== "7d" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={granularity === "day" ? "default" : "outline"}
            aria-pressed={granularity === "day"}
            onClick={() => replace(period, "day")}
          >
            Dia
          </Button>
          <Button
            type="button"
            size="sm"
            variant={granularity === "week" ? "default" : "outline"}
            aria-pressed={granularity === "week"}
            onClick={() => replace(period, "week")}
          >
            Semana
          </Button>
        </div>
      ) : null}
    </div>
  );
}
