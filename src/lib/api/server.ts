import { fetchFromApi } from "@/lib/api/fetch";
import type {
  Breakdown,
  DashboardSummary,
  Invoice,
  PaginatedInvoices,
  Period,
  RecentInvoices,
  SemanticSearchResponse,
  SpendOverTime,
  TopProducts,
} from "@/lib/api/types";

export async function getDashboardSummary(period: Period = "30d") {
  return fetchFromApi<DashboardSummary>("/v1/dashboard/summary", {
    searchParams: { period },
  });
}

export async function getSpendOverTime(period: Period = "30d", granularity = "day") {
  return fetchFromApi<SpendOverTime>("/v1/dashboard/spend-over-time", {
    searchParams: { period, granularity },
  });
}

export async function getTopEmitters(period: Period = "30d", limit = 10) {
  return fetchFromApi<Breakdown>("/v1/dashboard/top-emitters", {
    searchParams: { period, limit },
  });
}

export async function getTopProducts(period: Period = "30d", limit = 10) {
  return fetchFromApi<TopProducts>("/v1/dashboard/top-products", {
    searchParams: { period, limit },
  });
}

export async function getSpendByCategory(period: Period = "30d") {
  return fetchFromApi<Breakdown>("/v1/dashboard/spend-by-category", {
    searchParams: { period },
  });
}

export async function getRecentInvoices(limit = 10) {
  return fetchFromApi<RecentInvoices>("/v1/dashboard/recent", {
    searchParams: { limit },
  });
}

export async function getInvoices(params: {
  page?: number;
  page_size?: number;
  status?: string;
  created_from?: string;
  created_to?: string;
  sort_by?: string;
  sort_order?: string;
}) {
  return fetchFromApi<PaginatedInvoices>("/v1/invoices", {
    searchParams: params,
  });
}

export async function getInvoice(id: string) {
  return fetchFromApi<Invoice>(`/v1/invoices/${id}`);
}

export async function searchSemantic(query: string, limit = 20) {
  return fetchFromApi<SemanticSearchResponse>("/v1/search/semantic", {
    method: "POST",
    body: { query, limit },
  });
}

export async function getDashboardData(period: Period = "30d") {
  const [summary, spendOverTime, topEmitters, spendByCategory, recent] = await Promise.all([
    getDashboardSummary(period),
    getSpendOverTime(period),
    getTopEmitters(period),
    getSpendByCategory(period),
    getRecentInvoices(8),
  ]);

  return {
    summary,
    spendOverTime,
    topEmitters,
    spendByCategory,
    recent,
  };
}
