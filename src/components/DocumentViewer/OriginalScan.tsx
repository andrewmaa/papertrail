import { useState } from "react";
import type { RecordDocument } from "../../data/records";
import styles from "./OriginalScan.module.css";

type OriginalScanProps = {
  record: RecordDocument;
};

const FILLER_LINES = [92, 86, 95, 70, 88, 93, 64, 90, 78, 84, 58];

export default function OriginalScan({ record }: OriginalScanProps) {
  const [page, setPage] = useState(1);
  const total = Math.max(record.pages, 1);

  return (
    <div className={styles.wrap}>
      <figure className={styles.scan} aria-label={`Original scan of ${record.title}, page ${page} of ${total}`}>
        <div className={styles.paper}>
          <div className={styles.letterhead}>
            <span className={styles.docType}>{record.type}</span>
            <span className={styles.ref}>Ref. {record.id}</span>
          </div>

          {page === 1 ? (
            <>
              <p className={styles.title}>{record.title}</p>
              <dl className={styles.entries}>
                {record.fields.map((field) => (
                  <div key={field.label} className={styles.entry}>
                    <dt className={styles.entryLabel}>{field.label}:</dt>
                    <dd className={styles.entryValue}>{field.value}</dd>
                  </div>
                ))}
              </dl>
              <span className={styles.stamp} aria-hidden="true">
                Received
                <small>Box {record.box}</small>
              </span>
            </>
          ) : (
            <div className={styles.filler} aria-hidden="true">
              {FILLER_LINES.map((width, index) => (
                <span key={index} style={{ width: `${(width + page * 7 + index * 3) % 40 + 55}%` }} />
              ))}
            </div>
          )}

          <span className={styles.pageMark} aria-hidden="true">
            — {page} —
          </span>
        </div>
        <figcaption className={styles.caption}>Scanned original · read-only</figcaption>
      </figure>

      <nav className={styles.pager} aria-label="Original pages">
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          {"‹"}
        </button>
        <span className={styles.pageCount} aria-live="polite">
          Page {page} of {total}
        </span>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= total}
          aria-label="Next page"
        >
          {"›"}
        </button>
      </nav>
    </div>
  );
}
