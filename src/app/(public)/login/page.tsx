"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "@/lib/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendMagicLink(email);
      setSent(true);
      toast.success("Verifique seu e-mail para continuar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Verifique seu e-mail"
        description="Enviamos um link de acesso para o endereço informado."
        panelVariant="default"
      >
        <div className="space-y-5 text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            Acesse{" "}
            <strong className="font-medium text-foreground">{email}</strong> e clique no link para
            entrar na plataforma.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Usar outro e-mail
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Entrar"
      description="Informe seu e-mail corporativo para receber um link de acesso seguro."
      showAccessCta
      panelVariant="login"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            className="h-10"
          />
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de acesso"}
        </Button>
      </form>
    </AuthShell>
  );
}
