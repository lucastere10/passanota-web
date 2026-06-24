import { notFound } from "next/navigation";

import { InvoiceDetailView } from "@/components/invoices/invoice-detail-view";
import { getInvoice } from "@/lib/api/server";

export default async function NotaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch {
    notFound();
  }

  return <InvoiceDetailView initialInvoice={invoice} />;
}
