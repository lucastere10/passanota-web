export class ApiUnavailableError extends Error {
  readonly code = "API_UNAVAILABLE" as const;

  constructor(message = "Serviço temporariamente indisponível. Tente novamente em instantes.") {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED" as const;

  constructor(message = "Sessão expirada ou inválida.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function isApiUnavailableError(error: unknown): error is ApiUnavailableError {
  return error instanceof ApiUnavailableError;
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network")
  );
}
