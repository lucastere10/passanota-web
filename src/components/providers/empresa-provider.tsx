"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getMeClient } from "@/lib/api/auth";
import type { AuthMeResponse, EmpresaMembership } from "@/lib/api/types";
import { setEmpresaCookie } from "@/lib/auth/client";

type EmpresaContextValue = {
  me: AuthMeResponse | null;
  loading: boolean;
  empresas: EmpresaMembership[];
  selectedEmpresaId: string | null;
  setSelectedEmpresaId: (id: string) => void;
  refresh: () => Promise<void>;
};

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

function getEmpresaIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )passanota-empresa-id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function EmpresaProvider({
  children,
  initialMe,
}: {
  children: React.ReactNode;
  initialMe?: AuthMeResponse;
}) {
  const [me, setMe] = useState<AuthMeResponse | null>(initialMe ?? null);
  const [loading, setLoading] = useState(!initialMe);
  const [selectedEmpresaId, setSelectedEmpresaIdState] = useState<string | null>(() => {
    if (!initialMe) return null;
    const cookieId = getEmpresaIdFromCookie();
    if (cookieId && initialMe.empresas.some((e) => e.id === cookieId)) return cookieId;
    return initialMe.empresas[0]?.id ?? null;
  });

  const refresh = useCallback(async () => {
    try {
      const data = await getMeClient();
      setMe(data);
      const cookieId = getEmpresaIdFromCookie();
      const validCookie = cookieId && data.empresas.some((e) => e.id === cookieId);
      if (validCookie) {
        setSelectedEmpresaIdState(cookieId);
      } else if (data.empresas.length === 1) {
        setEmpresaCookie(data.empresas[0].id);
        setSelectedEmpresaIdState(data.empresas[0].id);
      } else {
        setSelectedEmpresaIdState(null);
      }
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialMe) void refresh();
  }, [initialMe, refresh]);

  const setSelectedEmpresaId = useCallback((id: string) => {
    setEmpresaCookie(id);
    setSelectedEmpresaIdState(id);
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      me,
      loading,
      empresas: me?.empresas ?? [],
      selectedEmpresaId,
      setSelectedEmpresaId,
      refresh,
    }),
    [me, loading, selectedEmpresaId, setSelectedEmpresaId, refresh],
  );

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>;
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}
