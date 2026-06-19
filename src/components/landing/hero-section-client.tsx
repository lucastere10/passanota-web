"use client";

import Link from "next/link";
import { ArrowDownRight, FileText, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockReceiptFeed } from "@/hooks/use-mock-receipt-feed";

const BAR_HEIGHTS = [40, 55, 35, 70, 50, 85, 60, 75, 45, 90, 65, 80];

const TOP_BAR_INDICES = [5, 9];

const LINE_POINTS =
  "M0,80 L30,65 L60,70 L90,45 L120,50 L150,30 L180,38 L210,22 L240,35 L270,18 L300,28 L330,12";

export function HeroSectionClient() {
  const receipts = useMockReceiptFeed(1);
  const latestReceipt = receipts[0];

  return (
    <section className="ledger-bg relative flex min-h-[calc(100dvh-var(--header-height))] items-center overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="hero-shimmer pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:py-12">
        <div className="space-y-6">
          <p
            className="animate-fade-in text-sm font-medium uppercase tracking-widest text-primary"
            style={{ animationDelay: "0ms" }}
          >
            Controle de custos via notas fiscais
          </p>
          <h1
            className="animate-fade-in text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-[3.25rem]"
            style={{ animationDelay: "80ms" }}
          >
            Cada nota fiscal registrada. Cada gasto sob controle.
          </h1>
          <p
            className="animate-fade-in max-w-md text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            Fotografe notas fiscais no desktop ou no celular pareado. O PassaNota extrai os dados
            automaticamente e transforma cada compra em visibilidade sobre onde o dinheiro da sua
            empresa está indo.
          </p>
          <div
            className="animate-fade-in flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="lg" render={<Link href="/register" />}>
              Solicitar acesso
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/login" />}>
              Entrar
            </Button>
          </div>
        </div>

        <div className="relative space-y-3 md:pl-4">
          <div className="grid grid-cols-2 gap-3">
            <Card
              size="sm"
              className="animate-fade-in ring-foreground/5"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Total gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold tracking-tight">R$ 48.320</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="animate-fade-in ring-foreground/5"
              style={{ animationDelay: "280ms" }}
            >
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold tracking-tight">127</p>
                <p className="mt-1 text-sm text-muted-foreground">Processadas</p>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in ring-foreground/5" style={{ animationDelay: "360ms" }}>
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
                            ? `${400 + i * 50}ms, ${1.4 + TOP_BAR_INDICES.indexOf(i) * 0.5}s`
                            : `${400 + i * 50}ms`,
                        }}
                      />
                    );
                  })}
                </div>
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 330 90"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d={LINE_POINTS}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="400"
                    className="auth-line-draw text-primary/50"
                    style={{ animationDelay: "900ms" }}
                  />
                </svg>
              </div>
            </CardContent>
          </Card>

          {latestReceipt ? (
            <Card
              key={latestReceipt.id}
              size="sm"
              className="auth-receipt-enter ring-foreground/5"
            >
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent">
                  <FileText className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium">{latestReceipt.emitter}</p>
                  <p className="text-sm text-muted-foreground">NF-e capturada agora</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-semibold">{latestReceipt.amount}</p>
                  <p className="flex items-center justify-end gap-0.5 text-sm text-primary">
                    <ArrowDownRight className="h-3 w-3" />
                    Registrada
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
