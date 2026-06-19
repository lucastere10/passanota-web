"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState, useTransition } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchSemanticClient } from "@/lib/api/client";
import type { SemanticSearchResult } from "@/lib/api/types";
import { formatCurrency, formatDateTime, formatSimilarity } from "@/lib/format";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(() => {
      startTransition(async () => {
        try {
          const response = await searchSemanticClient(deferredQuery.trim());
          setResults(response.results);
          setError(null);
        } catch (err) {
          setResults([]);
          setError(err instanceof Error ? err.message : "Erro na busca.");
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [deferredQuery]);

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Busca semântica</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: carne, supermercado, detergente..."
            aria-label="Buscar produtos"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Busca por significado nos itens das notas usando pgvector.
          </p>
        </CardContent>
      </Card>

      {isPending ? <p className="text-sm text-muted-foreground">Buscando...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {deferredQuery.trim().length >= 2 && !isPending && results.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum item encontrado para &quot;{deferredQuery}&quot;.
        </div>
      ) : null}

      <div className="grid gap-3">
        {results.map((result) => (
          <Card key={result.item_id}>
            <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{result.description}</p>
                <p className="text-sm text-muted-foreground">
                  {result.emitter_name ?? "—"} · {formatDateTime(result.issued_at)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono">{formatCurrency(result.total_price)}</span>
                <span className="text-muted-foreground">{formatSimilarity(result.similarity)}</span>
                <Link href={`/notas/${result.invoice_id}`} className="text-primary hover:underline">
                  Ver nota
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
