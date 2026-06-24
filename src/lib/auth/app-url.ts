const INVALID_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);

function isInvalidHost(host: string, allowLocalhost = false): boolean {
  const hostname = host.toLowerCase().split(":")[0] ?? host;
  if (allowLocalhost && hostname === "localhost") {
    return false;
  }
  return INVALID_HOSTS.has(hostname);
}

function originFromHost(host: string, proto = "https", allowLocalhost = false): string | null {
  const trimmedHost = host.split(",")[0]?.trim();
  if (!trimmedHost || isInvalidHost(trimmedHost, allowLocalhost)) {
    return null;
  }

  const trimmedProto = proto.split(",")[0]?.trim() ?? "https";
  return `${trimmedProto}://${trimmedHost}`;
}

export function getConfiguredAppOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) {
    return null;
  }

  try {
    const parsed = new URL(configured);
    // Explicit config is trusted (incl. localhost for dev). Only block 0.0.0.0.
    if (parsed.hostname === "0.0.0.0") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/** Origin público do frontend — evita redirects para 0.0.0.0 atrás do Cloud Run. */
export function getRequestOrigin(request: Request): string {
  const allowLocalhost = process.env.NODE_ENV === "development";

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const origin = originFromHost(
      forwardedHost,
      request.headers.get("x-forwarded-proto") ?? "https",
      allowLocalhost,
    );
    if (origin) {
      return origin;
    }
  }

  const host = request.headers.get("host");
  if (host) {
    const proto = allowLocalhost ? "http" : (request.headers.get("x-forwarded-proto") ?? "https");
    const origin = originFromHost(host, proto, allowLocalhost);
    if (origin) {
      return origin;
    }
  }

  try {
    const origin = new URL(request.url).origin;
    if (!isInvalidHost(new URL(origin).host, allowLocalhost)) {
      return origin;
    }
  } catch {
    // fall through
  }

  const configured = getConfiguredAppOrigin();
  if (configured) {
    return configured;
  }

  throw new Error(
    "Could not resolve public app origin. Set NEXT_PUBLIC_APP_URL to your public frontend URL.",
  );
}
