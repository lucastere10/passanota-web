"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useEmpresa } from "@/components/providers/empresa-provider";

export function GestorGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { me, selectedEmpresaId, loading } = useEmpresa();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    const membership = me?.empresas.find((e) => e.id === selectedEmpresaId);
    if (!membership || membership.role !== "gestor") {
      router.replace("/dashboard");
      return;
    }
    setAllowed(true);
  }, [loading, me, router, selectedEmpresaId]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
