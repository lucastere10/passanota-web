"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/constants";
import type { InvoiceDateRange } from "@/lib/invoices/constants";
import type { InvoiceStatus } from "@/lib/api/types";

const STATUS_OPTIONS: InvoiceStatus[] = ["parsed", "pending", "failed"];

const RANGES: { value: InvoiceDateRange; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
];

export function InvoiceListFilters({
  currentStatus,
  currentRange,
  hasActiveFilters,
  disabled,
  onRangeChange,
  onStatusChange,
  onClear,
}: {
  currentStatus?: InvoiceStatus;
  currentRange?: InvoiceDateRange;
  hasActiveFilters: boolean;
  disabled?: boolean;
  onRangeChange: (range?: InvoiceDateRange) => void;
  onStatusChange: (status?: InvoiceStatus) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGES.map(({ value, label }) => {
        const active = currentRange === value;
        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => onRangeChange(active ? undefined : value)}
          >
            {label}
          </Button>
        );
      })}

      <Select
        value={currentStatus ?? "all"}
        onValueChange={(value) => {
          if (!value || value === "all") {
            onStatusChange(undefined);
            return;
          }
          onStatusChange(value as InvoiceStatus);
        }}
      >
        <SelectTrigger className="w-[180px]" disabled={disabled}>
          <SelectValue placeholder="Todos os status">
            {currentStatus ? INVOICE_STATUS_LABELS[currentStatus] : "Todos os status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {INVOICE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || !hasActiveFilters}
        aria-label="Limpar filtros"
        onClick={onClear}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
