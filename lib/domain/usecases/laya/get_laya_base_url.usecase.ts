export function getLayaBaseUrl(): string {
  const url = process.env.LAYA_SERVER_URL || "http://localhost:8000";
  return url.replace(/\/+$/, "");
}
