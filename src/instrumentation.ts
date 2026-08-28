const PING_TIMEOUT_MS = 8000;

async function pingApiHealthLive() {
  const { getApiUrl } = await import("@/lib/api/env");
  const { withApiGatewayHeaders } = await import("@/lib/api/id-token");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const headers = await withApiGatewayHeaders({ Accept: "application/json" });
    await fetch(`${getApiUrl()}/health/live`, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    // Fire-and-forget: a API fria ou ausente não pode bloquear o boot do web.
  } finally {
    clearTimeout(timer);
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  void pingApiHealthLive();
}
