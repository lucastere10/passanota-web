import { NotasView } from "@/components/invoices/notas-view";
import { getInvoices } from "@/lib/api/server";
import { parseInvoiceListParams, toInvoicesApiParams } from "@/lib/invoices/query";

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    range?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}) {
  const params = await searchParams;
  const query = parseInvoiceListParams(params);
  const fallbackData = await getInvoices(toInvoicesApiParams(query));

  return <NotasView fallbackData={fallbackData} initialQuery={query} />;
}
