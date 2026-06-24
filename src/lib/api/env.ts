export function getApiUrl(): string {
  return process.env.PASSANOTA_API_URL ?? "http://localhost:8000";
}
