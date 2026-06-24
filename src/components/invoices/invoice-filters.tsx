"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function InvoiceFilters({
  currentUf,
  currentStatus,
}: {
  currentUf?: string;
  currentStatus?: InvoiceStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildHref(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={currentUf ?? "all"}
        onValueChange={(value) => {
          if (!value) return;
          router.push(buildHref({ uf: value, status: currentStatus }));
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas UFs</SelectItem>
          <SelectItem value="SP">SP</SelectItem>
          <SelectItem value="RJ">RJ</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentStatus ?? "all"}
        onValueChange={(value) => {
          if (!value) return;
          router.push(buildHref({ uf: currentUf, status: value }));
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          <SelectItem value="parsed">Processada</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="failed">Falhou</SelectItem>
        </SelectContent>
      </Select>

      <Link href={pathname} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        Limpar
      </Link>
    </div>
  );
}
