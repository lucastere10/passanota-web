import { PageHeader } from "@/components/layout/page-header";
import { ScanPanel } from "@/components/scan/scan-panel";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Capturar nota fiscal"
        description="Tire uma foto da nota para extrair os dados automaticamente."
      />
      <ScanPanel />
    </div>
  );
}
