import { PageHeader } from "@/components/layout/page-header";
import { SearchPanel } from "@/components/search/search-panel";

export default function BuscaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Busca"
        description="Encontre compras por descrição, mesmo com palavras diferentes."
      />
      <SearchPanel />
    </div>
  );
}
