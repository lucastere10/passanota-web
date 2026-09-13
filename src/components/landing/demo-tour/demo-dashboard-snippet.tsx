"use client";

import { ArrowDownRight, FileText, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_SCENARIO } from "@/lib/demo/demo-scenario";
import { formatCurrency } from "@/lib/format";

const BAR_HEIGHTS = [40, 55, 35, 70, 50, 85, 60, 75, 45, 90, 65, 80];
const TOP_BAR_INDICES = [5, 9];

export function DemoDashboardSnippet() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm" className="ring-foreground/5">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight">R$ 48.663</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary" />
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="ring-foreground/5">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight">128</p>
            <p className="mt-1 text-sm text-muted-foreground">Processadas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="ring-foreground/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Gastos ao longo do tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-24">
            <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1.5">
              {BAR_HEIGHTS.map((h, i) => {
                const isTop = TOP_BAR_INDICES.includes(i);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm bg-primary/70 ${isTop ? "auth-bar-breathe" : "auth-bar-enter"}`}
                    style={{
                      height: `${h}%`,
                      animationDelay: isTop
                        ? `${200 + i * 40}ms, ${1.2 + TOP_BAR_INDICES.indexOf(i) * 0.5}s`
                        : `${200 + i * 40}ms`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="auth-receipt-enter ring-foreground/5">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent">
            <FileText className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">{DEMO_SCENARIO.emitter}</p>
            <p className="text-sm text-muted-foreground">NF-e capturada agora</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-semibold">
              {formatCurrency(String(DEMO_SCENARIO.total))}
            </p>
            <p className="flex items-center justify-end gap-0.5 text-sm text-primary">
              <ArrowDownRight className="h-3 w-3" />
              Registrada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
