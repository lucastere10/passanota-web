import { unstable_cache } from "next/cache";

import { fetchFromApi } from "@/lib/api/fetch";
import type {
  Breakdown,
  DashboardAllResponse,
  DashboardSummary,
  Invoice,
  PaginatedInvoices,
  Period,
  RecentInvoices,
  SemanticSearchResponse,
  SpendOverTime,
  SpendOverTimeByCategory,
  StackedBreakdown,
  TopProducts,
} from "@/lib/api/types";
import { getAuthHeaders } from "@/lib/auth/session";

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

export async function getSpendOverTimeByCategory(period: Period = "30d", granularity = "day") {
  return fetchFromApi<SpendOverTimeByCategory>("/v1/dashboard/spend-over-time-by-category", {
    searchParams: { period, granularity },
  });
}

export async function getTopEmittersByCategory(period: Period = "30d", limit = 10) {
  return fetchFromApi<StackedBreakdown>("/v1/dashboard/top-emitters-by-category", {
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

const getCachedDashboardAll = unstable_cache(
  async (period: Period, empresaId: string, authorization: string) => {
    return fetchFromApi<DashboardAllResponse>("/v1/dashboard", {
      searchParams: { period },
      headers: {
        Authorization: authorization,
        "X-Empresa-Id": empresaId,
      },
    });
  },
  ["dashboard-all"],
  { revalidate: 30 },
);

export async function getDashboardData(period: Period = "30d") {
  const authHeaders = (await getAuthHeaders()) as Record<string, string>;
  const empresaId = authHeaders["X-Empresa-Id"];
  const authorization = authHeaders.Authorization;

  if (!empresaId) {
    throw new Error("Empresa não selecionada");
  }
  if (!authorization) {
    throw new Error("Sessão expirada ou inválida");
  }

  const data = await getCachedDashboardAll(period, empresaId, authorization);

  return {
    summary: data.summary,
    spendOverTime: data.spend_over_time,
    spendByCategoryStacked: data.spend_by_category_stacked,
    topEmitters: data.top_emitters,
    topEmittersStacked: data.top_emitters_stacked,
    spendByCategory: data.spend_by_category,
    topProducts: data.top_products,
    recent: data.recent,
  };
}
