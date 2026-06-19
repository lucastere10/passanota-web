"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitInterest } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitInterest({ email, nome: nome || undefined, mensagem: mensagem || undefined });
      setSent(true);
      toast.success("Interesse registrado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Obrigado pelo interesse"
        description="Recebemos sua solicitação e entraremos em contato em breve."
        panelVariant="default"
      >
        <div className="text-center">
          <Button variant="outline" className="w-full" render={<Link href="/login" />}>
            Voltar ao login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Solicitar acesso"
      description="Informe seus dados e nossa equipe entrará em contato sobre a plataforma."
      panelVariant="register"
      footer={
        <p className="text-center text-base text-muted-foreground">
          Já tem convite?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            E-mail *
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
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mensagem" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Mensagem
          </Label>
          <textarea
            id="mensagem"
            rows={3}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Conte um pouco sobre sua empresa e necessidade"
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
            )}
          />
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar solicitação"}
        </Button>
      </form>
    </AuthShell>
  );
}
