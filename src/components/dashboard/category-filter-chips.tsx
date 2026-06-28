"use client";

import { cn } from "@/lib/utils";

export type CategoryFilterOption = {
  label: string;
  slug: string | null;
  percentage?: number;
};

type CategoryFilterChipsProps = {
  categories: CategoryFilterOption[];
  selected: string | null;
  onChange: (slug: string | null) => void;
  className?: string;
};

export function CategoryFilterChips({
  categories,
  selected,
  onChange,
  className,
}: CategoryFilterChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          selected === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug ?? cat.label}
          type="button"
          onClick={() => onChange(cat.slug)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            selected === cat.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          {cat.label}
          {cat.percentage != null ? (
            <span className="ml-1 opacity-70">{cat.percentage.toFixed(0)}%</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
