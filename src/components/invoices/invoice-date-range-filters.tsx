"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import type { InvoiceDateRange } from "@/lib/invoices/constants";
import { cn } from "@/lib/utils";

const RANGES: { value: InvoiceDateRange; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
];

export function InvoiceDateRangeFilters({ currentRange }: { currentRange?: InvoiceDateRange }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(range?: InvoiceDateRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (!range) {
      params.delete("range");
    } else {
      params.set("range", range);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {RANGES.map(({ value, label }) => {
        const active = currentRange === value;
        return (
          <Link
            key={value}
            href={active ? buildHref() : buildHref(value)}
            className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }))}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
