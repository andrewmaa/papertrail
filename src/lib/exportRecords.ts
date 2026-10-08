import type { RecordDocument } from "../data/records";

const STAGGER_MS = 300;

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function triggerDownload(href: string, filename?: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename ?? "";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadCsv(records: RecordDocument[], filename: string) {
  const header = ["ID", "Type", "Title", "Status", "Pages", "Box", "Extracted fields"];
  const rows = records.map((record) => [
    record.id,
    record.type,
    record.title,
    record.status,
    record.pages,
    record.box,
    record.fields.map((field) => `${field.label}: ${field.value}`).join("; "),
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

export function exportRecordsAsCsv(records: RecordDocument[]) {
  downloadCsv(records, `papertrail-export-${new Date().toISOString().slice(0, 10)}.csv`);
}

/** Downloads a record's uploaded originals, or its extracted fields as CSV when it has none. */
export function downloadRecord(record: RecordDocument) {
  const sources = (record.sourcePreviewUrls ?? []).filter(Boolean);
  if (sources.length === 0) {
    downloadCsv([record], `${record.id}.csv`);
    return;
  }

  sources.forEach((source, index) => {
    const url = new URL(source, window.location.href);
    url.searchParams.set("download", "1");
    window.setTimeout(() => triggerDownload(url.toString()), index * STAGGER_MS);
  });
}
