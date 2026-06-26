import { SearchX } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function BuscaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Busca"
        description="Encontre compras por descrição, mesmo com palavras diferentes."
      />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Busca temporariamente indisponível</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              A busca semântica está em manutenção e voltará em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
