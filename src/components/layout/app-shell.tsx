"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Settings,
  Shield,
} from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { UserProfileSheet } from "@/components/layout/user-profile-sheet";
import { useEmpresa } from "@/components/providers/empresa-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/scan", label: "Capturar", icon: Camera },
  { href: "/notas", label: "Notas", icon: FileText },
  { href: "/busca", label: "Busca", icon: Search },
];

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-lg transition-colors",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="text-sm font-bold">{label}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { me, selectedEmpresaId } = useEmpresa();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isGestor =
    me?.empresas.find((e) => e.id === selectedEmpresaId)?.role === "gestor";

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  const sidebarCollapsed = mounted && collapsed;

  return (
    <div className="min-h-dvh bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden h-dvh flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-14" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-sidebar-border",
            sidebarCollapsed
              ? "flex-col items-center justify-center gap-1 py-2"
              : "h-14 items-center justify-between px-3",
          )}
        >
          <BrandLogo
            href="/dashboard"
            size="md"
            variant={sidebarCollapsed ? "icon" : "full"}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={active}
                collapsed={sidebarCollapsed}
              />
            );
          })}

          {isGestor && (
            <NavLink
              href="/configuracoes/dispositivos"
              label="Dispositivos"
              icon={Settings}
              active={pathname.startsWith("/configuracoes")}
              collapsed={sidebarCollapsed}
            />
          )}

          {me?.is_platform_admin && (
            <NavLink
              href="/admin/empresas"
              label="Admin"
              icon={Shield}
              active={pathname.startsWith("/admin")}
              collapsed={sidebarCollapsed}
            />
          )}
        </nav>

        <div className="mt-auto shrink-0 border-t border-sidebar-border p-2">
          <UserProfileSheet collapsed={sidebarCollapsed} />
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[margin] duration-200",
          sidebarCollapsed ? "md:ml-14" : "md:ml-56",
        )}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:hidden">
          <BrandLogo href="/dashboard" size="md" />
          <UserProfileSheet collapsed triggerClassName="w-auto px-1" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>

        <nav className="sticky bottom-0 z-20 grid shrink-0 grid-cols-4 border-t border-border bg-card px-2 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-bold",
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
  );
}
