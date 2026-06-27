"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import type { CaptureQueueItem } from "@/lib/scan/detection-types";
import { cn } from "@/lib/utils";

type CaptureQueueProps = {
  items: CaptureQueueItem[];
  invoiceHref?: (invoiceId: string) => string;
  /** overlay: compact strip positioned absolutely inside the camera preview */
  variant?: "default" | "overlay";
  className?: string;
};

export function CaptureQueue({
  items,
  invoiceHref = (id) => `/notas/${id}`,
  variant = "default",
  className,
}: CaptureQueueProps) {
  if (items.length === 0) return null;

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-x-0 bottom-3 z-10 flex items-center gap-2 overflow-x-auto px-3 pb-1 pt-1",
          className,
        )}
      >
        {items.map((item) => (
          <QueueThumbnail
            key={item.localId}
            item={item}
            invoiceHref={invoiceHref}
            size="sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-t border-border bg-background/95 px-3 py-3 backdrop-blur-sm transition-all",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Em processamento ({items.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <QueueThumbnail key={item.localId} item={item} invoiceHref={invoiceHref} size="md" />
        ))}
      </div>
    </div>
  );
}

function QueueThumbnail({
  item,
  invoiceHref,
  size = "md",
}: {
  item: CaptureQueueItem;
  invoiceHref: (invoiceId: string) => string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  const content = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border-2 bg-muted shadow-md",
        dim,
        size === "sm" ? "border-white/30" : "border-border",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnailDataUrl}
        alt="Captura da nota"
        className="h-full w-full object-cover"
      />
      <StatusOverlay status={item.status} size={size} />
    </div>
  );

  if (item.status === "parsed" && item.invoiceId) {
    return (
      <Link href={invoiceHref(item.invoiceId)} className="shrink-0" title="Ver nota processada">
        <div className="space-y-0.5">
          {content}
          {item.invoice?.ai_confidence && size === "md" ? (
            <p className="text-center text-[10px] font-medium text-green-600">
              {Math.round(Number(item.invoice.ai_confidence) * 100)}%
            </p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <div
      className="shrink-0"
      title={
        item.status === "failed"
          ? (item.errorMessage ?? "Falha no processamento")
          : "Processando nota"
      }
    >
      {content}
    </div>
  );
}

function StatusOverlay({
  status,
  size = "md",
}: {
  status: CaptureQueueItem["status"];
  size?: "sm" | "md";
}) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (status === "uploading" || status === "pending") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
        <Loader2
          className={cn(
            "animate-spin text-white",
            iconClass,
            status === "pending" && "text-orange-300",
          )}
        />
      </div>
    );
  }

  if (status === "parsed") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <CheckCircle2 className={cn("text-green-400", iconClass)} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
      <AlertCircle className={cn("text-red-400", iconClass)} />
    </div>
  );
}
