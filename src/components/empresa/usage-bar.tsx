"use client";

import type { EmpresaUsage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function UsageBar({ usage }: { usage: EmpresaUsage }) {
  if (usage.is_unlimited) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">Plano ilimitado</p>
        <p className="text-xs text-muted-foreground">
          {usage.invoices_this_month} nota{usage.invoices_this_month !== 1 ? "s" : ""} este mês
        </p>
      </div>
    );
  }

  const limit = usage.monthly_invoice_limit ?? 0;
  const pct = usage.usage_percentage ?? 0;
  const clamped = Math.min(pct, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>
          {usage.invoices_this_month} / {limit} notas
        </span>
        <span className="tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
