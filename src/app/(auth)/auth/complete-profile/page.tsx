"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfileClient, getMeClient } from "@/lib/api/auth";
import { setEmpresaCookie } from "@/lib/auth/client";
import { resolvePostLoginPath } from "@/lib/auth/post-login-redirect";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<{ empresa_nome: string; role: string } | null>(
    null,
  );

  useEffect(() => {
    async function checkProfile() {
      try {
        const me = await getMeClient();
        if (me.profile_complete) {
          if (me.empresas.length === 1) setEmpresaCookie(me.empresas[0].id);
          router.replace(resolvePostLoginPath(me, next));
          return;
        }
        if (me.pending_invite) {
          setPendingInvite({
            empresa_nome: me.pending_invite.empresa_nome,
            role: me.pending_invite.role,
          });
        } else if (me.is_platform_admin) {
          router.replace("/admin/empresas");
          return;
        } else {
          router.replace("/login");
          return;
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    void checkProfile();
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await completeProfileClient(nome);
      if (me.empresas.length === 1) setEmpresaCookie(me.empresas[0].id);
      toast.success("Cadastro concluído!");
      router.replace(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao completar cadastro");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Finalizar cadastro</h1>
          {pendingInvite && (
            <p className="text-sm text-muted-foreground">
              Você foi convidado para <strong>{pendingInvite.empresa_nome}</strong> como{" "}
              <strong>{pendingInvite.role === "gestor" ? "Gestor" : "Operador"}</strong>
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Seu nome</Label>
            <Input
              id="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como deseja ser chamado"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando..." : "Concluir cadastro"}
          </Button>
        </form>
      </div>
    </div>
  );
}
