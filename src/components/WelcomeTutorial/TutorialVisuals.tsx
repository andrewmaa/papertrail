import { useEffect, useState } from "react";
import logoMark from "../../assets/logo-mark.svg";
import editIcon from "../../assets/icons/edit.svg";
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
          <svg
            className={styles.dragCursor}
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              d="M5 3L19 11.5L12.5 13L9.5 19.5L5 3Z"
              fill="var(--color-ink-strong)"
              stroke="var(--color-paper)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.uploadedFile}>
          <span className={styles.fileBadge}>PDF</span>
          lease-agreement.pdf
          <span className={styles.uploadBar}>
            <span className={styles.uploadBarFill} />
          </span>
        </div>
      </div>
      <div className={styles.uploadMeta}>
        <span className={`${styles.chip} ${styles.metaChip}`}>
          <span className={styles.dot} data-tone="digitized" /> Detected: English
        </span>
        <span className={`${styles.chip} ${styles.metaChip}`} data-delay="">
          Output: Structured fields
        </span>
      </div>
    </div>
  );
}

const STATUS_TITLES = ["Invoice #4471", "Lease agreement", "Tax return 2023"];
const STATUS_LABELS = { queued: "Queued", processing: "Processing", digitized: "Digitized" };
const STATUS_TICKS = 7;
const STATUS_TICK_MS = 1100;

function statusFor(tick: number, index: number): keyof typeof STATUS_LABELS {
  if (tick <= index) return "queued";
  if (tick <= index + 2) return "processing";
  return "digitized";
}

function useLoopingTick(length: number, intervalMs: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTick(length - 1);
      return;
    }
    const id = window.setInterval(() => setTick((value) => (value + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs]);
  return tick;
}

export function StatusVisual() {
  const tick = useLoopingTick(STATUS_TICKS, STATUS_TICK_MS);
  const statuses = STATUS_TITLES.map((_, index) => statusFor(tick, index));
  const done = statuses.filter((status) => status === "digitized").length;

  return (
    <div className={styles.statusStack}>
      {STATUS_TITLES.map((title, index) => {
        const tone = statuses[index];
        return (
          <div
            key={title}
            className={styles.statusCard}
            data-tone={tone}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className={styles.thumb}>
              <Sheet lines={3} />
              {tone === "processing" && <span className={styles.scanLine} />}
            </div>
            <div className={styles.statusBody}>
              <span className={styles.statusTitle}>{title}</span>
              <span className={styles.statusMeta}>3 pages · Box A-12</span>
            </div>
            <span key={tone} className={styles.statusPill} data-tone={tone}>
              <span className={styles.dot} data-tone={tone} />
              {STATUS_LABELS[tone]}
            </span>
          </div>
        );
      })}
      <div className={styles.progressTrack} aria-hidden="true">
        <span className={styles.progressFill} style={{ width: `${(done / 3) * 100}%` }} />
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

function OriginalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 17.6775 17.6775" fill="none" aria-hidden="true">
      <path
        d="M10.3 2.2H4.6C4.0 2.2 3.5 2.7 3.5 3.3V14.4C3.5 15.0 4.0 15.5 4.6 15.5H13.1C13.7 15.5 14.2 15.0 14.2 14.4V6.1L10.3 2.2Z"
        stroke="currentColor"
        strokeWidth="1.32581"
        strokeLinejoin="round"
      />
      <path d="M10.1 2.4V6.3H14" stroke="currentColor" strokeWidth="1.32581" strokeLinejoin="round" />
      <path d="M6.1 9.3H11.6M6.1 12.1H9.9" stroke="currentColor" strokeWidth="1.32581" strokeLinecap="round" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 17.6775 17.6775" fill="none" aria-hidden="true">
      <path
        d="M15.4679 8.83876C15.4624 9.84198 15.2008 10.8272 14.7079 11.701C14.2151 12.5748 13.5073 13.3083 12.6516 13.8321C11.796 14.3558 10.8207 14.6524 9.81836 14.6937C8.81599 14.7351 7.81965 14.5198 6.92375 14.0684L2.20974 15.4678L3.60921 10.7538C3.48347 9.97518 3.51232 9.17938 3.69413 8.41188C3.87593 7.64438 4.20712 6.92021 4.6688 6.2807C5.13047 5.6412 5.71359 5.09889 6.38485 4.68474C7.05611 4.27059 7.80237 3.9927 8.58102 3.86696C9.35967 3.74121 10.1555 3.77007 10.923 3.95187C11.6905 4.13368 12.4146 4.46487 13.0541 4.92654C13.6937 5.38822 14.236 5.97133 14.6501 6.64259C15.0643 7.31385 15.3421 8.06011 15.4679 8.83876Z"
        stroke="currentColor"
        strokeWidth="1.32581"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const REVIEW_TOOLS = [
  { label: "Edit", icon: <img src={editIcon} alt="" width={16} height={16} /> },
  { label: "Original", icon: <OriginalIcon /> },
  { label: "Notes", icon: <NotesIcon /> },
  { label: "Share", icon: <img src={shareIcon} alt="" width={16} height={16} /> },
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
            {tool.icon}
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
