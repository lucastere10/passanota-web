import type { ChartConfig } from "@/components/ui/chart";

/** Distinct chart palette — maps to CSS vars in globals.css */
export const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export function getChartColor(index: number): string {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length];
}

export function getCategoryColor(label: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash + label.charCodeAt(i) * (i + 1)) % CHART_COLOR_VARS.length;
  }
  return CHART_COLOR_VARS[(hash + index) % CHART_COLOR_VARS.length];
}

export function buildChartConfigFromLabels(
  labels: string[],
): ChartConfig {
  const config: ChartConfig = {};
  labels.forEach((label, index) => {
    const key = slugifyChartKey(label);
    config[key] = {
      label,
      color: getCategoryColor(label, index),
    };
  });
  return config;
}

/** Safe key for ChartConfig / Recharts dataKey */
export function slugifyChartKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "outros";
}

export function colorMapForLabels(labels: string[]): Map<string, string> {
  const map = new Map<string, string>();
  labels.forEach((label, index) => {
    map.set(label, getCategoryColor(label, index));
  });
  return map;
}
