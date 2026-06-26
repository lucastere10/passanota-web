import type { InvoiceStatus } from "@/lib/api/types";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        status === "parsed" && "border-primary/30 bg-accent text-accent-foreground",
        status === "failed" && "border-destructive/30 bg-destructive/10 text-destructive",
        status === "pending" &&
          "animate-pulse border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
      )}
    >
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
