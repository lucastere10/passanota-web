import { BarChart3, Camera, Search, Shield } from "lucide-react";

export type AuthPanelVariant = "login" | "register" | "default";

export const AUTH_BENEFITS = [
  {
    icon: Camera,
    title: "Captura em segundos",
    description: "Foto no desktop ou celular pareado.",
  },
  {
    icon: BarChart3,
    title: "Visão de gastos",
    description: "Dashboard com totais e variação por período.",
  },
  {
    icon: Search,
    title: "Busca por item",
    description: "Encontre compras pela descrição do produto.",
  },
  {
    icon: Shield,
    title: "Dados por empresa",
    description: "Acesso isolado por perfil e organização.",
  },
] as const;

export const AUTH_PANEL_COPY: Record<
  AuthPanelVariant,
  { headline: string; subline: string }
> = {
  login: {
    headline: "Seu painel de controle fiscal",
    subline: "Acompanhe gastos, notas e compras em um só lugar.",
  },
  register: {
    headline: "Controle de custos que começa na nota fiscal",
    subline: "Solicite acesso e nossa equipe configura sua empresa.",
  },
  default: {
    headline: "Gastos consolidados a partir de cada nota fiscal",
    subline: "Controle de custos via notas fiscais para empresas.",
  },
};
