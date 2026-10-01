import type { RecordDocument } from "../data/records";

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportRecordsAsCsv(records: RecordDocument[]) {
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
  const link = document.createElement("a");
  link.href = url;
  link.download = `papertrail-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
