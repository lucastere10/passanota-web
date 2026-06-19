"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { BarChart3, Camera, FileText, LogOut, Search, Settings, Shield } from "lucide-react";



import { BrandLogo } from "@/components/layout/brand-logo";

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

import { signOutClient } from "@/lib/auth/client";

import { cn } from "@/lib/utils";



const NAV_ITEMS = [

  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },

  { href: "/scan", label: "Capturar", icon: Camera },

  { href: "/notas", label: "Notas", icon: FileText },

  { href: "/busca", label: "Busca", icon: Search },

];



export function AppShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  const { me, empresas, selectedEmpresaId, setSelectedEmpresaId } = useEmpresa();

  const isGestor =

    me?.empresas.find((e) => e.id === selectedEmpresaId)?.role === "gestor";



  async function handleSignOut() {

    await signOutClient();

  }



  return (

    <div className="min-h-screen bg-background">

      <div className="mx-auto flex min-h-screen max-w-7xl">

        <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">

          <div className="flex h-16 items-center border-b border-sidebar-border px-6">

            <BrandLogo href="/dashboard" size="md" />

          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-3">

            {NAV_ITEMS.map((item) => {

              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (

                <Link

                  key={item.href}

                  href={item.href}

                  className={cn(

                    "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-base transition-colors",

                    active

                      ? "border-primary bg-accent text-accent-foreground"

                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",

                  )}

                >

                  <Icon className="h-4 w-4" />

                  {item.label}

                </Link>

              );

            })}

            {isGestor && (

              <Link

                href="/configuracoes/dispositivos"

                className={cn(

                  "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-base transition-colors",

                  pathname.startsWith("/configuracoes")

                    ? "border-primary bg-accent text-accent-foreground"

                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",

                )}

              >

                <Settings className="h-4 w-4" />

                Dispositivos

              </Link>

            )}

            {me?.is_platform_admin && (

              <Link

                href="/admin/empresas"

                className={cn(

                  "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-base transition-colors",

                  pathname.startsWith("/admin")

                    ? "border-primary bg-accent text-accent-foreground"

                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",

                )}

              >

                <Shield className="h-4 w-4" />

                Admin

              </Link>

            )}

          </nav>

        </aside>



        <div className="flex min-w-0 flex-1 flex-col">

          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">

            <div className="md:hidden">

              <BrandLogo href="/dashboard" size="md" />

            </div>

            <div className="hidden flex-1 items-center gap-4 md:flex">

              {empresas.length > 1 && selectedEmpresaId ? (

                <Select

                  value={selectedEmpresaId}

                  onValueChange={(value) => {

                    if (value) setSelectedEmpresaId(value);

                  }}

                >

                  <SelectTrigger className="w-48">

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

              ) : null}

              {empresas.length === 1 && (

                <p className="text-base text-muted-foreground">{empresas[0].nome}</p>

              )}

            </div>

            <div className="flex items-center gap-2">

              <ThemeToggle />

              <Button variant="ghost" size="icon-sm" onClick={() => void handleSignOut()} aria-label="Sair">

                <LogOut className="h-4 w-4" />

              </Button>

            </div>

          </header>



          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>



          <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card px-2 py-2 md:hidden">

            {NAV_ITEMS.map((item) => {

              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (

                <Link

                  key={item.href}

                  href={item.href}

                  className={cn(

                    "flex flex-col items-center gap-1 rounded-md px-1 py-2 text-xs",

                    active ? "text-primary" : "text-muted-foreground",

                  )}

                >

                  <Icon className="h-4 w-4" />

                  {item.label}

                </Link>

              );

            })}

          </nav>

        </div>

      </div>

    </div>

  );

}


