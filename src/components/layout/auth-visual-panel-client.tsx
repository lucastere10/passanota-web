"use client";

import { BarChart3, Camera, FileText } from "lucide-react";

import { useMockReceiptFeed } from "@/hooks/use-mock-receipt-feed";
import {
  AUTH_BENEFITS,
  AUTH_PANEL_COPY,
  type AuthPanelVariant,
} from "@/lib/auth-marketing";

const BAR_HEIGHTS = [28, 42, 35, 58, 44, 72, 50, 65, 38, 80, 55, 68, 45, 75, 52, 62];

const TOP_BAR_INDICES = [5, 9, 13];

const LINE_POINTS =
  "M0,80 L30,65 L60,70 L90,45 L120,50 L150,30 L180,38 L210,22 L240,35 L270,18 L300,28 L330,12";

const FLOW_STEPS = [
  { icon: Camera, label: "Capturar" },
  { icon: FileText, label: "Extrair" },
  { icon: BarChart3, label: "Analisar" },
];

export function AuthVisualPanelClient({
  variant = "default",
}: {
  variant?: AuthPanelVariant;
}) {
  const receipts = useMockReceiptFeed(1);
  const latestReceipt = receipts[0];
  const copy = AUTH_PANEL_COPY[variant];

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-5 overflow-hidden bg-[#1a2e29] p-8 lg:gap-6 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#2d6b5e_0%,_transparent_55%)] opacity-[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 31px, #ffffff 31px, #ffffff 32px)",
        }}
        aria-hidden
      />
      <div className="auth-shimmer pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div className="max-w-sm space-y-2">
          <p className="text-xl font-medium leading-snug tracking-[-0.01em] text-white/70">
            {copy.headline}
          </p>
          <p className="text-base leading-relaxed text-white/40">{copy.subline}</p>
        </div>
        <p className="shrink-0 font-mono text-base font-medium text-white/50">R$ 48.320</p>
      </div>

      <div className="relative h-36 w-full max-w-xl">
        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1">
          {BAR_HEIGHTS.map((h, i) => {
            const isTop = TOP_BAR_INDICES.includes(i);
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm bg-[#2d6b5e]/70 ${isTop ? "auth-bar-breathe" : "auth-bar-enter"}`}
                style={{
                  height: `${h}%`,
                  animationDelay: isTop
                    ? `${i * 60}ms, ${1.2 + TOP_BAR_INDICES.indexOf(i) * 0.6}s`
                    : `${i * 60}ms`,
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
            stroke="#4a9e8f"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="400"
            className="auth-line-draw"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        {AUTH_BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-[#2d6b5e]/30">
                <Icon className="size-3.5 text-[#7ec8be]" />
              </div>
              <p className="text-sm font-medium text-white/75">{benefit.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/40">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </div>

      {latestReceipt ? (
        <div
          key={latestReceipt.id}
          className="auth-receipt-enter relative rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-white/50">Última nota registrada</p>
              <p className="truncate text-base font-medium text-white/80">{latestReceipt.emitter}</p>
            </div>
            <p className="shrink-0 font-mono text-base font-medium text-white/90">
              {latestReceipt.amount}
            </p>
          </div>
        </div>
      ) : null}

      <div className="relative mt-auto space-y-4">
        <div className="relative px-2">
          <div className="absolute top-3 right-8 left-8 h-px bg-white/10" aria-hidden />
          <div className="auth-flow-dot absolute top-1.5 size-2 rounded-full bg-[#2d6b5e] shadow-[0_0_8px_#2d6b5e]" />
          <div className="relative flex justify-between">
            {FLOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center gap-1.5">
                  <div className="flex size-6 items-center justify-center rounded-full border border-white/15 bg-[#1a2e29]">
                    <Icon className="size-3 text-white/40" />
                  </div>
                  <span className="text-xs font-medium text-white/35">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-white/30">Dados isolados por empresa</p>
      </div>
    </div>
  );
}
