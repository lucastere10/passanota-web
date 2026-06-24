import { getApiUrl } from "@/lib/api/env";

let authClientPromise: Promise<import("google-auth-library").IdTokenClient> | null = null;

function shouldUseIam(): boolean {
  if (process.env.PASSANOTA_API_USE_IAM === "false") return false;
  const apiUrl = getApiUrl();
  return !apiUrl.includes("localhost") && !apiUrl.includes("127.0.0.1");
}

async function getIdTokenClient() {
  if (!authClientPromise) {
    authClientPromise = (async () => {
      const { GoogleAuth } = await import("google-auth-library");
      const auth = new GoogleAuth();
      return auth.getIdTokenClient(getApiUrl());
    })();
  }
  return authClientPromise;
}

export async function getApiIdToken(): Promise<string | null> {
  if (!shouldUseIam()) return null;
  try {
    const client = await getIdTokenClient();
    const headers = await client.getRequestHeaders();
    const authorization =
      typeof headers.get === "function"
        ? headers.get("Authorization")
        : String((headers as unknown as Record<string, string | undefined>).Authorization ?? "");
    if (!authorization?.startsWith("Bearer ")) return null;
    return authorization.slice("Bearer ".length);
  } catch {
    return null;
  }
}

/** Adds Cloud Run IAM token; moves Supabase JWT to X-Supabase-Authorization when needed. */
export async function withApiGatewayHeaders(
  headers: Record<string, string>,
): Promise<Record<string, string>> {
  const idToken = await getApiIdToken();
  if (!idToken) return headers;

  const result = { ...headers };
  const supabaseAuth = result.Authorization;
  if (supabaseAuth) {
    result["X-Supabase-Authorization"] = supabaseAuth;
    delete result.Authorization;
  }
  result.Authorization = `Bearer ${idToken}`;
  return result;
}
