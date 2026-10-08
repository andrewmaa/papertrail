/** Base URL for the Express API. Empty in local dev (Vite proxies `/api`). */
export function apiUrl(path: string): string {
  const raw = String(import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  const base = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** POST a form with upload progress (0–1). `onUploaded` fires once the request body is sent. */
export function postFormWithProgress(
  path: string,
  body: FormData,
  handlers: { onProgress?: (fraction: number) => void; onUploaded?: () => void } = {},
): Promise<{ ok: boolean; status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl(path));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) handlers.onProgress?.(event.loaded / event.total);
    };
    xhr.upload.onload = () => handlers.onUploaded?.();
    xhr.onload = () =>
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, text: xhr.responseText });
    xhr.onerror = () => reject(new Error("Network error — couldn’t reach the API server"));
    xhr.send(body);
  });
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
