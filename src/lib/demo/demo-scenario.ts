export type DemoCategorySlug =
  | "alimentacao"
  | "bebidas"
  | "higiene"
  | "limpeza"
  | "vestuario"
  | "outros";

export type DemoItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: DemoCategorySlug;
};

export type DemoScenario = {
  emitter: string;
  cnpj: string;
  issuedAt: string;
  items: DemoItem[];
  total: number;
  confidence: number;
};

export const DEMO_CATEGORY_LABELS: Record<DemoCategorySlug, string> = {
  alimentacao: "Alimentação",
  bebidas: "Bebidas",
  higiene: "Higiene",
  limpeza: "Limpeza",
  vestuario: "Vestuário",
  outros: "Outros",
};

export const DEMO_SCENARIO: DemoScenario = {
  emitter: "Mercado Central Ltda.",
  cnpj: "00000000000191",
  issuedAt: "2026-08-15",
  items: [
    {
      description: "Arroz tipo 1 5kg",
      quantity: 1,
      unitPrice: 124.9,
      totalPrice: 124.9,
      category: "alimentacao",
    },
    {
      description: "Feijão carioca 2kg",
      quantity: 1,
      unitPrice: 35.8,
      totalPrice: 35.8,
      category: "alimentacao",
    },
    {
      description: "Carne moída 1kg",
      quantity: 1,
      unitPrice: 89.9,
      totalPrice: 89.9,
      category: "alimentacao",
    },
    {
      description: "Refrigerante cola 2L",
      quantity: 1,
      unitPrice: 11.99,
      totalPrice: 11.99,
      category: "bebidas",
    },
    {
      description: "Kit limpeza (detergente + papel)",
      quantity: 1,
      unitPrice: 80.21,
      totalPrice: 80.21,
      category: "limpeza",
    },
  ],
  total: 342.8,
  confidence: 0.87,
};

export const DEMO_REGISTER_MESSAGE =
  "Vi a demonstração no site e gostaria de testar a captura com notas da minha empresa.";

export const DEMO_STEP_LABELS = ["Capturar", "Extrair", "Analisar"] as const;

export type DemoTourStep = "intro" | "capture" | "extracting" | "result" | "cta";

export function demoStepToPhase(step: DemoTourStep): number {
  switch (step) {
    case "intro":
      return 0;
    case "capture":
      return 1;
    case "extracting":
    case "result":
      return 2;
    case "cta":
      return 3;
    default:
      return 0;
  }
}
