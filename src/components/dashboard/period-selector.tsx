"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import type { Period } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PERIODS: Period[] = ["7d", "30d", "90d", "year"];

const LABELS: Record<Period, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  year: "Ano",
};

export function PeriodSelector({ current }: { current: Period }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((period) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("period", period);
        const active = current === period;
        return (
          <Link
            key={period}
            href={`${pathname}?${params.toString()}`}
            className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }))}
          >
            {LABELS[period]}
          </Link>
        );
      })}
    </div>
  );
}
