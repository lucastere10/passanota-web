"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  Breakdown,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
  TopProducts,
} from "@/lib/api/types";
import {
  buildChartConfigFromLabels,
  colorMapForLabels,
  getChartColor,
  slugifyChartKey,
} from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const amountConfig = {
  amount: {
    label: "Gasto",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ColorDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}

function truncateLabel(label: string, max = 28): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

export function SpendOverTimeChart({ data }: { data: SpendOverTime }) {
  const chartData = data.points.map((point) => ({
    date: point.date.slice(5).replace("-", "/"),
    amount: Number.parseFloat(point.amount),
    count: point.count,
  }));

  if (chartData.length === 0) {
    return <EmptyChart message="Sem dados de gastos no período." />;
  }

  return (
    <ChartContainer config={amountConfig} className="h-[280px] w-full">
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => `R$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(String(value))}
              labelFormatter={(label, payload) => {
                const count = payload?.[0]?.payload?.count as number | undefined;
                return count != null ? `${label} · ${count} nota${count !== 1 ? "s" : ""}` : String(label);
              }}
            />
          }
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function StackedSpendOverTimeChart({ data }: { data: SpendOverTimeByCategory }) {
  const categories = data.categories;
  if (categories.length === 0 || data.points.length === 0) {
    return <EmptyChart message="Sem dados de gastos no período." />;
  }

  const config = buildChartConfigFromLabels(categories);
  const chartData = data.points.map((point) => {
    const row: Record<string, string | number> = {
      date: point.date.slice(5).replace("-", "/"),
    };
    for (const cat of categories) {
      row[slugifyChartKey(cat)] = 0;
    }
    for (const seg of point.segments) {
      row[slugifyChartKey(seg.label)] = Number.parseFloat(seg.amount);
    }
    return row;
  });

  return (
    <ChartContainer config={config} className="h-[280px] w-full">
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => `R$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const key = String(name);
                const label = config[key]?.label ?? key;
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span>{label}</span>
                    <span className="font-mono font-medium">{formatCurrency(String(value))}</span>
                  </span>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((cat, index) => {
          const key = slugifyChartKey(cat);
          return (
            <Bar
              key={key}
              dataKey={key}
              stackId="spend"
              fill={`var(--color-${key})`}
              radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          );
        })}
      </BarChart>
    </ChartContainer>
  );
}

export function CategoryPieChart({ data }: { data: Breakdown }) {
  if (data.items.length === 0) {
    return <EmptyChart message="Sem dados para categorias." />;
  }

  const chartData = data.items.map((item, index) => ({
    label: item.label,
    value: Number.parseFloat(item.amount),
    percentage: item.percentage,
    fill: getChartColor(index),
  }));

  const config = buildChartConfigFromLabels(data.items.map((i) => i.label));

  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="mx-auto h-[240px] w-full max-w-[320px]">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="label"
                formatter={(value, name) => (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="font-medium">{name}</span>
                    <span className="font-mono">{formatCurrency(String(value))}</span>
                  </span>
                )}
              />
            }
          />
          <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={85}>
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="label" />} />
        </PieChart>
      </ChartContainer>
      <ul className="space-y-2">
        {data.items.slice(0, 8).map((item, index) => (
          <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <ColorDot color={getChartColor(index)} />
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {item.percentage.toFixed(0)}%
              </span>
            </span>
            <span className="shrink-0 font-mono text-muted-foreground">
              {formatCurrency(item.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RankedBreakdownChart({ data, title }: { data: Breakdown; title: string }) {
  if (data.items.length === 0) {
    return <EmptyChart message={`Sem dados para ${title.toLowerCase()}.`} />;
  }

  const maxValue = Math.max(...data.items.map((i) => Number.parseFloat(i.amount)));

  return (
    <ul className="space-y-3" style={{ minHeight: Math.max(240, data.items.length * 36) }}>
      {data.items.map((item, index) => {
        const value = Number.parseFloat(item.amount);
        const widthPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = getChartColor(index);

        return (
          <li key={item.label} className="grid grid-cols-[1fr_minmax(0,2fr)] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <span className="truncate text-sm font-medium" title={item.label}>
                {truncateLabel(item.label, 32)}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted/60">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                  title={`${item.label}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(0)}%)`}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {formatCurrency(item.amount)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function StackedEmittersChart({ data }: { data: StackedBreakdown }) {
  if (data.items.length === 0) {
    return <EmptyChart message="Sem dados para estabelecimentos." />;
  }

  const categories = data.categories;
  const config = buildChartConfigFromLabels(categories);
  const colorMap = colorMapForLabels(categories);

  const chartData = data.items.map((item) => {
    const row: Record<string, string | number> = {
      label: truncateLabel(item.label, 24),
      fullLabel: item.label,
    };
    for (const cat of categories) {
      row[slugifyChartKey(cat)] = 0;
    }
    for (const seg of item.segments) {
      row[slugifyChartKey(seg.label)] = Number.parseFloat(seg.amount);
    }
    return row;
  });

  const height = Math.max(280, data.items.length * 40);

  return (
    <div className="space-y-3">
      <ChartContainer config={config} className="w-full" style={{ height }}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 4, right: 16, top: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  (payload?.[0]?.payload?.fullLabel as string) ?? ""
                }
                formatter={(value, name) => {
                  const key = String(name);
                  const label = config[key]?.label ?? key;
                  return (
                    <span className="flex w-full items-center justify-between gap-4">
                      <span>{label}</span>
                      <span className="font-mono font-medium">{formatCurrency(String(value))}</span>
                    </span>
                  );
                }}
              />
            }
          />
          {categories.map((cat) => (
            <Bar
              key={slugifyChartKey(cat)}
              dataKey={slugifyChartKey(cat)}
              stackId="emitter"
              fill={colorMap.get(cat)}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ColorDot color={colorMap.get(cat) ?? getChartColor(0)} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TopProductsChart({ data }: { data: TopProducts }) {
  if (data.items.length === 0) {
    return <EmptyChart message="Sem dados de produtos no período." />;
  }

  const maxValue = Math.max(...data.items.map((i) => Number.parseFloat(i.total_amount)));

  return (
    <ul className="space-y-3" style={{ minHeight: Math.max(240, data.items.length * 36) }}>
      {data.items.map((item, index) => {
        const value = Number.parseFloat(item.total_amount);
        const widthPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = getChartColor(index);

        return (
          <li key={item.description} className="grid grid-cols-[1fr_minmax(0,2fr)] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <ColorDot color={color} />
              <span className="truncate text-sm" title={item.description}>
                {truncateLabel(item.description, 36)}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted/60">
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {formatCurrency(item.total_amount)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function InvoiceVolumeChart({ data }: { data: SpendOverTime }) {
  const chartData = data.points.map((point) => ({
    date: point.date.slice(5).replace("-", "/"),
    count: point.count,
  }));

  if (chartData.length === 0) {
    return <EmptyChart message="Sem dados de volume no período." />;
  }

  const countConfig = {
    count: { label: "Notas", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={countConfig} className="h-[220px] w-full">
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function AvgTicketChart({ data }: { data: SpendOverTime }) {
  const chartData = data.points
    .map((point) => {
      const amount = Number.parseFloat(point.amount);
      const avg = point.count > 0 ? amount / point.count : 0;
      return {
        date: point.date.slice(5).replace("-", "/"),
        avg,
      };
    })
    .filter((row) => row.avg > 0);

  if (chartData.length === 0) {
    return <EmptyChart message="Sem dados de ticket médio no período." />;
  }

  const avgConfig = {
    avg: { label: "Ticket médio", color: "var(--chart-7)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={avgConfig} className="h-[220px] w-full">
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => `R$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => formatCurrency(String(value))} />
          }
        />
        <Bar dataKey="avg" fill="var(--color-avg)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

/** @deprecated Use CategoryPieChart or RankedBreakdownChart */
export function BreakdownList({
  title,
  data,
  variant = "bar",
}: {
  title: string;
  data: Breakdown;
  variant?: "bar" | "pie";
}) {
  if (variant === "pie") {
    return <CategoryPieChart data={data} />;
  }
  return <RankedBreakdownChart data={data} title={title} />;
}
