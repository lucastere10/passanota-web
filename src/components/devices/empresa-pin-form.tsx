"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEmpresaPinClient } from "@/lib/api/device-client";

export function EmpresaPinForm({
  empresaId,
  pinConfigured,
  onUpdated,
}: {
  empresaId: string;
  pinConfigured: boolean;
  onUpdated: () => void;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error("O PIN deve ter pelo menos 4 caracteres.");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("Os PINs não coincidem.");
      return;
    }

    startTransition(async () => {
      try {
        await updateEmpresaPinClient(empresaId, pin);
        setPin("");
        setConfirmPin("");
        toast.success("PIN da empresa atualizado.");
        onUpdated();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar PIN.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PIN da empresa</CardTitle>
        <CardDescription>
          {pinConfigured
            ? "O PIN é exigido ao parear novos dispositivos móveis."
            : "Defina um PIN antes de conectar dispositivos."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="pin">{pinConfigured ? "Novo PIN" : "PIN"}</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={20}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirmar PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={20}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {pinConfigured ? "Atualizar PIN" : "Definir PIN"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
