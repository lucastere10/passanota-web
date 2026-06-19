import type { InvoiceStatus } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  parsed: "Processada",
  pending: "Pendente",
  failed: "Falhou",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        status === "parsed" && "border-primary/30 bg-accent text-accent-foreground",
        status === "failed" && "border-destructive/30 bg-destructive/10 text-destructive",
        status === "pending" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
