"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyAccessKey({ value }: { value: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast.success("Chave copiada.");
      }}
    >
      Copiar chave
    </Button>
  );
}
