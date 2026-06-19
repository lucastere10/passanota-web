import { fetchFromApi } from "@/lib/api/fetch";
import type { AuthMeResponse } from "@/lib/api/types";

export async function getMeServer() {
  return fetchFromApi<AuthMeResponse>("/v1/auth/me");
}
