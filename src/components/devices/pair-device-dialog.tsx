"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, QrCode, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createPairingSessionClient } from "@/lib/api/device-client";
import type { PairingSession } from "@/lib/api/types";

function PairingQr({ url }: { url: string }) {
  const [QrComponent, setQrComponent] = useState<React.ComponentType<{ value: string; size: number }> | null>(
    null,
  );

  useEffect(() => {
    import("qrcode.react").then((mod) => {
      setQrComponent(() => mod.QRCodeSVG);
    });
  }, []);

  if (!QrComponent) {
    return <div className="h-48 w-48 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <QrComponent value={url} size={192} />
    </div>
  );
}

function formatRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expirado";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PairDeviceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [session, setSession] = useState<PairingSession | null>(null);
  const [remaining, setRemaining] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setSession(null);
      return;
    }

    startTransition(async () => {
      try {
        const data = await createPairingSessionClient();
        setSession(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao gerar sessão.");
        onClose();
      }
    });
  }, [open, onClose]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => {
      setRemaining(formatRemaining(session.expires_at));
    }, 1000);
    setRemaining(formatRemaining(session.expires_at));
    return () => clearInterval(timer);
  }, [session]);

  async function copyLink() {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.pairing_url);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Conectar dispositivo</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isPending || !session ? (
          <p className="text-sm text-muted-foreground">Gerando QR code...</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <PairingQr url={session.pairing_url} />
            <p className="text-center text-sm text-muted-foreground">
              Escaneie o QR code ou abra o link no celular. Expira em{" "}
              <span className="font-mono font-medium text-foreground">{remaining}</span>.
            </p>
            <Button variant="outline" className="w-full" onClick={() => void copyLink()}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
