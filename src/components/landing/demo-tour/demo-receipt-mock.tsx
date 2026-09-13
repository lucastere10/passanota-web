"use client";

import { cn } from "@/lib/utils";
import { DEMO_SCENARIO } from "@/lib/demo/demo-scenario";
import { formatCnpj, formatCurrency, formatDate } from "@/lib/format";

type DemoReceiptMockProps = {
  flashActive?: boolean;
  className?: string;
};

export function DemoReceiptMock({ flashActive = false, className }: DemoReceiptMockProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-xs", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 rounded-lg bg-white transition-opacity duration-200",
          flashActive ? "opacity-90" : "opacity-0",
        )}
        aria-hidden
      />
      <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary/40" aria-hidden />
      <div className="absolute -inset-1 rounded-xl border border-primary/20" aria-hidden />

      <div className="relative overflow-hidden rounded-lg border border-border bg-[#faf9f6] px-4 py-5 font-mono text-[11px] leading-relaxed text-neutral-800 shadow-sm dark:bg-neutral-100 dark:text-neutral-900">
        <div className="border-b border-dashed border-neutral-400 pb-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wide">{DEMO_SCENARIO.emitter}</p>
          <p className="mt-1 text-[10px] text-neutral-600">
            CNPJ: {formatCnpj(DEMO_SCENARIO.cnpj)}
          </p>
          <p className="mt-1 text-[10px] text-neutral-600">
            {formatDate(DEMO_SCENARIO.issuedAt)} · Cupom demonstrativo
          </p>
        </div>

        <div className="my-3 space-y-1.5">
          {DEMO_SCENARIO.items.map((item) => (
            <div key={item.description} className="flex justify-between gap-2">
              <span className="truncate">{item.description}</span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(String(item.totalPrice))}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-neutral-400 pt-2">
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatCurrency(String(DEMO_SCENARIO.total))}</span>
          </div>
        </div>

        <p className="mt-3 text-center text-[9px] uppercase tracking-widest text-neutral-500">
          Dados fictícios para demonstração
        </p>
      </div>
    </div>
  );
}
