"use client";

import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

export function PwaInstallBanner({ compact = false }: Readonly<{ compact?: boolean }>) {
  const { visible, canPrompt, install, dismiss } = usePwaInstall();

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-border bg-card",
        compact
          ? "px-3 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]"
          : "px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]",
      )}
    >
      <Download className="size-4 shrink-0 text-primary" />
      <p className={cn("min-w-0 flex-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
        {canPrompt ? (
          <span className="text-foreground">Instale o PassaNota para abrir pelo ícone.</span>
        ) : (
          <>No Chrome: menu → Instalar app.</>
        )}
      </p>
      {canPrompt ? (
        <Button size="xs" onClick={() => void install()}>
          Instalar
        </Button>
      ) : null}
      <Button variant="ghost" size="icon-xs" onClick={dismiss} aria-label="Dispensar">
        <X />
      </Button>
    </div>
  );
}
