"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteInvoiceClient } from "@/lib/api/client";
import type { InvoiceStatus } from "@/lib/api/types";

export function InvoiceDeleteButton({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (status === "pending") {
    return null;
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteInvoiceClient(invoiceId);
        toast.success("Nota excluída.");
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir nota.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-label="Excluir nota"
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Excluir nota fiscal?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        loading={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
