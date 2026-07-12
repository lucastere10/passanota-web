"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/constants";
import type { InvoiceDateRange } from "@/lib/invoices/constants";
import type { InvoiceStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: InvoiceStatus[] = ["parsed", "pending", "failed"];

const RANGES: { value: InvoiceDateRange; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
];

export function InvoiceListFilters({
  currentStatus,
  currentRange,
  hasActiveFilters,
}: {
  currentStatus?: InvoiceStatus;
  currentRange?: InvoiceDateRange;
  hasActiveFilters: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildHref(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(next)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function buildRangeHref(range?: InvoiceDateRange) {
    return buildHref({ range, status: currentStatus });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGES.map(({ value, label }) => {
        const active = currentRange === value;
        return (
          <Link
            key={value}
            href={active ? buildRangeHref() : buildRangeHref(value)}
            className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }))}
          >
            {label}
          </Link>
        );
      })}

      <Select
        value={currentStatus ?? "all"}
        onValueChange={(value) => {
          if (!value || value === "all") {
            router.push(buildHref({ status: undefined, range: currentRange }));
            return;
          }
          router.push(buildHref({ status: value, range: currentRange }));
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos os status">
            {currentStatus ? INVOICE_STATUS_LABELS[currentStatus] : "Todos os status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {INVOICE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters ? (
        <Link
          href={pathname}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Limpar filtros"
        >
          <X className="size-4" />
        </Link>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Limpar filtros">
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
