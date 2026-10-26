// Accepts "", "/api", "https://host" or "https://host/api" and always yields a single trailing "/api".
export function buildApiBaseUrl(rawUrl) {
  const trimmed = String(rawUrl || "/api").trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}
