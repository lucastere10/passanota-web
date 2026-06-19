import { BarChart3, Camera, FileText } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    title: "Capturar",
    description:
      "Fotografe a nota fiscal no computador ou em um celular pareado à empresa. Cada captura entra no fluxo automaticamente.",
  },
  {
    icon: FileText,
    title: "Extrair",
    description:
      "Emitente, itens, valores e datas são extraídos da NF-e. Sem digitação manual, sem planilhas paralelas.",
  },
  {
    icon: BarChart3,
    title: "Analisar",
    description:
      "Dashboard com totais, variações e categorias. Busque compras por descrição de item, mesmo com palavras diferentes.",
  },
];

export function WorkflowSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-12 max-w-xl">
          <h2 className="text-balance">Do recibo ao relatório em três passos</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            O fluxo é simples porque o trabalho pesado fica com o sistema. Sua equipe só precisa
            registrar a nota.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
