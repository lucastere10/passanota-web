"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Camera, FileText } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { MobileSignOutButton } from "@/components/mobile/mobile-sign-out-button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/m/scan", label: "Capturar", icon: Camera },
  { href: "/m/notas", label: "Notas", icon: FileText },
];

export function MobileShell({
  children,
  empresaNome,
}: {
  children: React.ReactNode;
  empresaNome?: string | null;
}) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/m/scan");

  useEffect(() => {
    if (!hideHeader) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [hideHeader]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        hideHeader ? "h-dvh max-h-dvh overflow-hidden overscroll-none" : "min-h-dvh",
      )}
    >
      {!hideHeader ? (
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <BrandLogo href="/m/scan" size="md" />
              {empresaNome ? (
                <p className="text-sm text-muted-foreground">{empresaNome}</p>
              ) : null}
            </div>
            <MobileSignOutButton />
          </div>
        </header>
      ) : null}

      <main
        className={cn(
          "flex-1 px-4",
          hideHeader
            ? "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-2"
            : "py-3",
        )}
      >
        {children}
      </main>

      <nav className="z-20 grid shrink-0 grid-cols-2 border-t border-border bg-card px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
  );
}
