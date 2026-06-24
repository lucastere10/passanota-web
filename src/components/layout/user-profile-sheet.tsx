"use client";

import Link from "next/link";
import { ChevronRight, LogOut, Settings, Smartphone, User } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useEmpresa } from "@/components/providers/empresa-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type UserProfileSheetProps = {
  collapsed?: boolean;
  className?: string;
  triggerClassName?: string;
};

export function UserProfileSheet({
  collapsed = false,
  className,
  triggerClassName,
}: UserProfileSheetProps) {
  const { me, empresas, selectedEmpresaId, setSelectedEmpresaId } = useEmpresa();

  const userName = me?.user.nome ?? me?.user.email ?? "Usuário";
  const userEmail = me?.user.email;
  const selectedEmpresa = empresas.find((e) => e.id === selectedEmpresaId);
  const isGestor =
    me?.empresas.find((e) => e.id === selectedEmpresaId)?.role === "gestor";

  async function handleSignOut() {
    await signOutClient();
  }

  function handleMockAction(label: string) {
    toast.info(`${label} — em breve`);
  }

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted",
          collapsed ? "justify-center" : "justify-between",
          triggerClassName,
        )}
        title={collapsed ? userName : undefined}
      >
        <div className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {getInitials(userName)}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{userName}</p>
              {selectedEmpresa ? (
                <p className="truncate text-xs text-muted-foreground">{selectedEmpresa.nome}</p>
              ) : null}
            </div>
          )}
        </div>
        {!collapsed && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </SheetTrigger>

      <SheetContent side="right" className={cn("w-full sm:max-w-sm", className)}>
        <SheetHeader>
          <SheetTitle>Conta</SheetTitle>
          <SheetDescription>Gerencie seu perfil e preferências</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {getInitials(userName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{userName}</p>
              {userEmail ? (
                <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
              ) : null}
            </div>
          </div>

          {empresas.length > 1 && selectedEmpresaId ? (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Empresa
              </p>
              <Select
                value={selectedEmpresaId}
                onValueChange={(value) => {
                  if (value) setSelectedEmpresaId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : selectedEmpresa ? (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Empresa
              </p>
              <p className="text-sm font-bold">{selectedEmpresa.nome}</p>
            </div>
          ) : null}

          <Separator />

          <div className="space-y-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Aparência
            </p>
            <div className="flex items-center justify-between rounded-lg px-2 py-2">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Configurações
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-bold"
              onClick={() => handleMockAction("Meu perfil")}
            >
              <User className="h-4 w-4" />
              Meu perfil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-bold"
              onClick={() => handleMockAction("Preferências")}
            >
              <Settings className="h-4 w-4" />
              Preferências
            </Button>
            {isGestor ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 font-bold"
                render={<Link href="/configuracoes/dispositivos" />}
              >
                <Smartphone className="h-4 w-4" />
                Dispositivos
              </Button>
            ) : null}
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
