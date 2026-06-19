import Link from "next/link";

import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <MarketingShell>
      <HeroSection />
      <WorkflowSection />
      <FeaturesSection />
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-8 md:py-20">
          <h2 className="text-balance">Pronto para ter visibilidade sobre seus gastos?</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
            Solicite acesso à plataforma e comece a registrar notas fiscais com controle total sobre
            os custos da sua empresa.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/register" />}>
              Solicitar acesso
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/login" />}>
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
