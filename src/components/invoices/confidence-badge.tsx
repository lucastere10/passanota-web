import {
  CONFIDENCE_TIER_LABELS,
  formatConfidencePercent,
  getConfidenceTier,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ConfidenceBadgeProps = {
  value: string | number | null | undefined;
  className?: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
};

export function ConfidenceBadge({
  value,
  className,
  size = "md",
  showTooltip = true,
}: ConfidenceBadgeProps) {
  const tier = getConfidenceTier(value);
  const label = formatConfidencePercent(value);

  if (!tier || !label) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  return (
    <Badge
      variant="outline"
      title={showTooltip && tier !== "high" ? CONFIDENCE_TIER_LABELS[tier] : undefined}
      className={cn(
        "font-medium tabular-nums",
        size === "sm" && "px-1.5 py-0 text-[10px]",
        size === "md" && "text-xs",
        tier === "high" &&
          "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
        tier === "medium" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        tier === "low" && "border-destructive/30 bg-destructive/10 text-destructive",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
