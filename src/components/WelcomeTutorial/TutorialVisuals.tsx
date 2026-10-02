import logoMark from "../../assets/logo-mark.svg";
import editIcon from "../../assets/icons/edit.svg";
import notesIcon from "../../assets/icons/notes.svg";
import originalIcon from "../../assets/icons/original.svg";
import shareIcon from "../../assets/icons/share.svg";
import styles from "./TutorialVisuals.module.css";

function Sheet({ lines = 6 }: { lines?: number }) {
  return (
    <div className={styles.sheet}>
      <span className={styles.lineStrong} />
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className={styles.line} />
      ))}
    </div>
  );
}

export function WelcomeVisual() {
  return (
    <div className={styles.welcome}>
      <div className={`${styles.welcomeSheet} ${styles.welcomeBack}`}>
        <Sheet lines={5} />
      </div>
      <div className={`${styles.welcomeSheet} ${styles.welcomeMid}`}>
        <Sheet lines={5} />
      </div>
      <div className={`${styles.welcomeSheet} ${styles.welcomeFront}`}>
        <img src={logoMark} alt="" width={64} height={64} className={styles.welcomeMark} />
        <span className={styles.welcomeWord}>Papertrail</span>
      </div>
    </div>
  );
}

export function UploadVisual() {
  return (
    <div className={styles.window}>
      <div className={styles.windowHeader}>
        <span className={styles.windowTitle}>Upload new record</span>
        <span className={styles.windowClose}>{"\u00d7"}</span>
      </div>
      <div className={styles.dropzone}>
        <span className={styles.dropIcon}>
          <svg viewBox="0 0 80 80" width="28" height="28" fill="none" aria-hidden="true">
            <path
              d="M40 10V50M23.33 26.67L40 10L56.67 26.67M70 50V63.33C70 65.1 69.3 66.8 68.05 68.05C66.8 69.3 65.1 70 63.33 70H16.67C14.9 70 13.2 69.3 11.95 68.05C10.7 66.8 10 65.1 10 63.33V50"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className={styles.dropTitle}>Drop scans or PDFs here</span>
        <span className={styles.dropHint}>or click to browse</span>
        <div className={styles.dragFile}>
          <span className={styles.fileBadge}>PDF</span>
          lease-agreement.pdf
        </div>
      </div>
      <div className={styles.uploadMeta}>
        <span className={styles.chip}>
          <span className={styles.dot} data-tone="digitized" /> Detected: English
        </span>
        <span className={styles.chip}>Output: Structured fields</span>
      </div>
    </div>
  );
}

const STATUS_ROWS = [
  { title: "Invoice #4471", tone: "queued", label: "Queued" },
  { title: "Lease agreement", tone: "processing", label: "Processing" },
  { title: "Tax return 2023", tone: "digitized", label: "Digitized" },
] as const;

export function StatusVisual() {
  return (
    <div className={styles.statusStack}>
      {STATUS_ROWS.map((row, index) => (
        <div
          key={row.title}
          className={styles.statusCard}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className={styles.thumb}>
            <Sheet lines={3} />
          </div>
          <div className={styles.statusBody}>
            <span className={styles.statusTitle}>{row.title}</span>
            <span className={styles.statusMeta}>3 pages · Box A-12</span>
          </div>
          <span className={styles.statusPill} data-tone={row.tone}>
            <span className={styles.dot} data-tone={row.tone} />
            {row.label}
          </span>
        </div>
      ))}
      <div className={styles.progressTrack} aria-hidden="true">
        <span className={styles.progressFill} />
      </div>
    </div>
  );
}

const FILTER_TYPES = [
  { label: "Invoice", count: 12, checked: true },
  { label: "Contract", count: 4, checked: false },
  { label: "Medical", count: 7, checked: true },
  { label: "Tax", count: 3, checked: false },
];

export function SearchVisual() {
  return (
    <div className={styles.window}>
      <div className={styles.searchBar}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className={styles.searchText}>
          invoice
          <span className={styles.caret} />
        </span>
      </div>
      <div className={styles.filterLayout}>
        <div className={styles.filterList}>
          <span className={styles.filterHeading}>Document type</span>
          {FILTER_TYPES.map((type) => (
            <span key={type.label} className={styles.filterRow}>
              <span className={styles.checkbox} data-checked={type.checked || undefined} />
              {type.label}
              <span className={styles.filterCount}>{type.count}</span>
            </span>
          ))}
          <span className={styles.filterHeading}>Sort by</span>
          <span className={styles.sortChip}>Newest</span>
        </div>
        <div className={styles.resultGrid}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className={styles.resultCard}>
              <Sheet lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const REVIEW_TOOLS = [
  { icon: editIcon, label: "Edit" },
  { icon: originalIcon, label: "Original" },
  { icon: notesIcon, label: "Notes" },
  { icon: shareIcon, label: "Share" },
];

const REVIEW_FIELDS = [
  { label: "Vendor", value: "Harbor Supply Co." },
  { label: "Date", value: "2024-03-18" },
  { label: "Total", value: "$1,284.50" },
];

export function ReviewVisual() {
  return (
    <div className={styles.window}>
      <div className={styles.reviewLayout}>
        <div className={styles.reviewScan}>
          <Sheet lines={8} />
        </div>
        <div className={styles.reviewFields}>
          <span className={styles.filterHeading}>Extracted fields</span>
          {REVIEW_FIELDS.map((field, index) => (
            <span
              key={field.label}
              className={styles.field}
              data-highlight={index === 2 || undefined}
            >
              <span className={styles.fieldLabel}>{field.label}</span>
              <span className={styles.fieldValue}>{field.value}</span>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.toolbar}>
        {REVIEW_TOOLS.map((tool) => (
          <span key={tool.label} className={styles.tool}>
            <img src={tool.icon} alt="" width={16} height={16} />
            {tool.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const EXPORT_ROWS = [
  { title: "Invoice #4471", checked: true },
  { title: "Invoice #4472", checked: true },
  { title: "Lease agreement", checked: false },
  { title: "Tax return 2023", checked: true },
];

export function ExportVisual() {
  return (
    <div className={styles.window}>
      <div className={styles.exportList}>
        {EXPORT_ROWS.map((row) => (
          <span key={row.title} className={styles.exportRow} data-checked={row.checked || undefined}>
            <span className={styles.checkbox} data-checked={row.checked || undefined} />
            {row.title}
          </span>
        ))}
      </div>
      <div className={styles.exportActions}>
        <span className={styles.fakeButton}>Deselect all</span>
        <span className={`${styles.fakeButton} ${styles.fakePrimary}`}>Export (3)</span>
      </div>
      <div className={styles.csvFile}>
        <span className={styles.fileBadge}>CSV</span>
        papertrail-export.csv
      </div>
    </div>
  );
}
