import { BarChart3, Building2, Search, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Dashboard de gastos",
    description:
      "Totais, ticket médio, variação por período e gráficos por estabelecimento e categoria.",
  },
  {
    icon: Search,
    title: "Busca por item",
    description:
      "Encontre compras pela descrição do produto, mesmo quando o texto da nota varia entre fornecedores.",
  },
  {
    icon: Building2,
    title: "Multi-empresa e dispositivos",
    description:
      "Gerencie várias empresas, pareie celulares com PIN e QR code para captura em campo.",
  },
  {
    icon: Shield,
    title: "Dados isolados por empresa",
    description:
      "Cada organização com acesso controlado por perfil. Gestores e operadores com permissões distintas.",
  },
];

export function FeaturesSection() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-12 max-w-xl">
          <h2 className="text-balance">Ferramentas para quem precisa de números confiáveis</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Desenvolvido para gestores e equipes financeiras que não podem depender de estimativas.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent">
                  <Icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <h3 className="text-base font-semibold tracking-[-0.02em]">{feature.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
