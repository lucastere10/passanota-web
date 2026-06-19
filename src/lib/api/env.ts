function getApiKeyFromEnv(): string {
  const apiKey = process.env.PASSANOTA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("PASSANOTA_API_KEY não configurada.");
  }
  return apiKey;
}

export function getApiKey(): string {
  return getApiKeyFromEnv();
}

export function getApiUrl(): string {
  return process.env.PASSANOTA_API_URL ?? "http://localhost:8000";
}
