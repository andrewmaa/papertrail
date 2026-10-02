/** Base URL for the Express API. Empty in local dev (Vite proxies `/api`). */
export function apiUrl(path: string): string {
  const base = String(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function withApiAssetUrls<T extends { sourcePreviewUrls?: string[] }>(record: T): T {
  if (!record.sourcePreviewUrls?.length) return record;
  return {
    ...record,
    sourcePreviewUrls: record.sourcePreviewUrls.map((url) =>
      url.startsWith("http://") || url.startsWith("https://") ? url : apiUrl(url),
    ),
  };
}
