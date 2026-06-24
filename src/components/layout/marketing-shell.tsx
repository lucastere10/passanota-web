import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background [--header-height:4rem]">
      <header className="sticky top-0 z-30 h-(--header-height) shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-8">
          <BrandLogo href="/" size="lg" />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Entrar
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Solicitar acesso
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-base text-muted-foreground sm:flex-row md:px-8">
          <BrandLogo href="/" size="sm" />
          <p>&copy; {new Date().getFullYear()} PassaNota. Controle fiscal para empresas.</p>
        </div>
      </footer>
    </div>
  );
}
