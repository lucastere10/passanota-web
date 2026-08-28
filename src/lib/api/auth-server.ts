import { cache } from "react";

import { UnauthorizedError } from "@/lib/api/errors";
import { fetchFromApi } from "@/lib/api/fetch";
import type { AuthMeResponse } from "@/lib/api/types";
import { getAccessToken, getEmpresaId } from "@/lib/auth/session";

const ME_TTL_MS = 60_000;
const ME_CACHE_MAX = 200;

type MeCacheEntry = { value: AuthMeResponse; expiresAt: number };

const meCache = new Map<string, MeCacheEntry>();

function userIdFromAccessToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { sub?: unknown };
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

function getCachedMe(key: string): AuthMeResponse | undefined {
  const hit = meCache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt <= Date.now()) {
    meCache.delete(key);
    return undefined;
  }
  return hit.value;
}

function setCachedMe(key: string, value: AuthMeResponse) {
  if (meCache.size >= ME_CACHE_MAX) {
    const oldest = meCache.keys().next().value;
    if (oldest !== undefined) meCache.delete(oldest);
  }
  meCache.set(key, { value, expiresAt: Date.now() + ME_TTL_MS });
}

export const getMeServer = cache(async () => {
  const [token, empresaId] = await Promise.all([getAccessToken(), getEmpresaId()]);
  if (!token) {
    throw new UnauthorizedError();
  }
  const userId = userIdFromAccessToken(token);
  if (!userId) {
    throw new UnauthorizedError();
  }

  const cacheKey = `${userId}:${empresaId ?? ""}`;
  const cached = getCachedMe(cacheKey);
  if (cached) return cached;

  const me = await fetchFromApi<AuthMeResponse>("/v1/auth/me");
  setCachedMe(cacheKey, me);
  return me;
});
