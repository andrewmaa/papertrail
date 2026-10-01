import type { RecordDocument } from "../../data/records";
import Button from "../Button/Button";
import styles from "./PendingNotice.module.css";

type PendingNoticeProps = {
  record: RecordDocument;
  onViewOriginal: () => void;
};

export default function PendingNotice({ record, onViewOriginal }: PendingNoticeProps) {
  const processing = record.status === "Processing";

  return (
    <div className={styles.notice} role="status">
      <span className={styles.badge} data-processing={processing || undefined} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <h3 className={styles.heading}>
        {processing ? "Digitizing in progress" : "Waiting in the queue"}
      </h3>
      <p className={styles.body}>
        {processing
          ? `We're extracting fields from all ${record.pages} pages of this record. Check back later to review the digitized version.`
          : `This record is queued for digitization and hasn't been processed yet. Check back later to review the extracted fields.`}
      </p>
      <Button variant="outline" onClick={onViewOriginal}>
        View original document
      </Button>
    </div>
  );
}
