"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Breakdown, SpendOverTime } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";

const lineConfig = {
  amount: {
    label: "Gasto",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const pieConfig = {
  value: {
    label: "Valor",
  },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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
    <ChartContainer config={lineConfig} className="h-[280px] w-full">
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
              labelFormatter={(label) => `Data ${label}`}
            />
          }
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function BreakdownList({
  title,
  data,
  variant = "bar",
}: {
  title: string;
  data: Breakdown;
  variant?: "bar" | "pie";
}) {
  if (data.items.length === 0) {
    return <EmptyChart message={`Sem dados para ${title.toLowerCase()}.`} />;
  }

  const chartData = data.items.map((item) => ({
    label: item.label,
    value: Number.parseFloat(item.amount),
    percentage: item.percentage,
  }));

  if (variant === "pie") {
    return (
      <div className="space-y-4">
        <ChartContainer config={pieConfig} className="mx-auto h-[240px] w-full max-w-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(String(value))}
                  nameKey="label"
                />
              }
            />
            <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80}>
              {chartData.map((entry, index) => (
                <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="space-y-2">
          {data.items.slice(0, 5).map((item) => (
            <li key={item.label} className="flex items-center justify-between text-sm">
              <span className="truncate pr-4">{item.label}</span>
              <span className="font-mono text-muted-foreground">{formatCurrency(item.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ChartContainer config={lineConfig} className="h-[280px] w-full">
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => formatCurrency(String(value))} />
          }
        />
        <Bar dataKey="value" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  );
}
