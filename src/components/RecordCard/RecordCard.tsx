import downloadIcon from "../../assets/icons/download.svg";
import styles from "./RecordCard.module.css";

export type RecordStatus = "Digitized" | "Processing" | "Queued";

export type RecordCardProps = {
  id: string;
  type: string;
  title: string;
  status: RecordStatus;
  pages: number;
  box: string;
  onOpen?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  onDownload?: () => void;
};

const STATUS_TONE: Record<RecordStatus, string> = {
  Digitized: "digitized",
  Processing: "processing",
  Queued: "queued",
};

export default function RecordCard({
  id,
  type,
  title,
  status,
  pages,
  box,
  onOpen,
  selected = false,
  onToggleSelect,
  onDownload,
}: RecordCardProps) {
  const tone = STATUS_TONE[status];

  return (
    <div className={styles.wrapper} data-selected={selected || undefined}>
    <button type="button" className={styles.card} aria-label={`Open ${title}`} onClick={onOpen}>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.paperStack}>
          <div className={`${styles.sheet} ${styles.back}`} />
          <div className={`${styles.sheet} ${styles.mid}`} />
          <div className={`${styles.sheet} ${styles.front}`}>
            <span className={styles.lineStrong} />
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
          </div>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaId}>{id}</span>
        <span className={styles.metaType}>{type}</span>
      </div>

      <h3 className={styles.title}>{title}</h3>

      <footer className={styles.footer}>
        <span className={styles.status}>
          <span className={`${styles.dot} ${styles[tone]}`} />
          {status}
        </span>
        <span className={styles.detail}>
          {pages} pp · Box {box}
        </span>
      </footer>
    </button>
      {onToggleSelect ? (
        <label className={styles.select}>
          <input
            type="checkbox"
            className={styles.selectInput}
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${title}`}
          />
          <span className={styles.checkbox} aria-hidden="true" />
        </label>
      ) : null}
      {onDownload ? (
        <button
          type="button"
          className={styles.download}
          onClick={onDownload}
          aria-label={`Download ${title}`}
          title="Download"
        >
          <img src={downloadIcon} alt="" width={14} height={14} />
        </button>
      ) : null}
    </div>
  );
}
