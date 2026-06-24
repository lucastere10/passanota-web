import Link from "next/link";

import { AuthVisualPanel } from "@/components/layout/auth-visual-panel";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AUTH_BENEFITS } from "@/lib/auth-marketing";
import type { AuthPanelVariant } from "@/lib/auth-marketing";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
  showAccessCta?: boolean;
  panelVariant?: AuthPanelVariant;
};

function MobileBenefits() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:hidden">
      {AUTH_BENEFITS.slice(0, 3).map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div
            key={benefit.title}
            className="rounded-lg border border-border bg-card px-3 py-3"
          >
            <Icon className="mb-2 size-4 text-primary" />
            <p className="text-sm font-medium">{benefit.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function AuthShell({
  children,
  title,
  description,
  footer,
  showAccessCta = false,
  panelVariant = "default",
}: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:h-dvh lg:grid-cols-[2fr_3fr] lg:overflow-hidden">
      <div className="flex min-h-dvh flex-col bg-background lg:h-full lg:min-h-0 lg:overflow-hidden">
        <header className="flex shrink-0 items-center justify-between px-6 py-4 lg:px-10">
          <BrandLogo href="/" size="lg" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Voltar ao site
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 py-6 lg:min-h-0 lg:overflow-hidden lg:px-10 lg:py-4">
          <div className="mx-auto w-full max-w-[400px] space-y-6 lg:space-y-5">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 lg:p-5">{children}</div>

            {showAccessCta ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <Separator className="flex-1" />
                  <span className="text-sm font-medium text-muted-foreground">ou</span>
                  <Separator className="flex-1" />
                </div>
                <div className="rounded-xl border border-border bg-card p-5 lg:hidden">
                  <p className="text-base font-medium">Ainda não tem acesso?</p>
                  <p className="mt-1 text-base text-muted-foreground">
                    Solicite acesso à plataforma e nossa equipe entrará em contato.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    render={<Link href="/register" />}
                  >
                    Solicitar acesso
                  </Button>
                </div>
                <p className="hidden text-center text-sm text-muted-foreground lg:block">
                  Ainda não tem acesso?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Solicitar acesso
                  </Link>
                </p>
              </div>
            ) : null}

            {footer}

            <MobileBenefits />
          </div>
        </div>

        <footer className="shrink-0 px-6 py-3 lg:px-10">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PassaNota
          </p>
        </footer>
      </div>

      <div className="hidden h-full min-h-0 lg:block">
        <AuthVisualPanel variant={panelVariant} />
      </div>
    </div>
  );
}
