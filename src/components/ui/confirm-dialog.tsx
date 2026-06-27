"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "supports-backdrop-filter:backdrop-blur-xs",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-border bg-popover p-6 shadow-lg",
            "transition duration-200 ease-in-out",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <DialogPrimitive.Title className="text-base font-semibold text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <DialogPrimitive.Close
              render={<Button variant="outline" disabled={loading} />}
            >
              {cancelLabel}
            </DialogPrimitive.Close>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              disabled={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { ConfirmDialog };
