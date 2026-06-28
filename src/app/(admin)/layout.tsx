import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <BrandLogo href="/admin/overview" suffix="Admin" size="md" />
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Voltar ao app
            </Link>
          </div>
          <ThemeToggle />
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
