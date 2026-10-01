import styles from "./FormField.module.css";

export type FormFieldProps = {
  label: string;
  value: string;
  flagged?: boolean;
  annotationId?: number;
};

export default function FormField({ label, value, flagged = false, annotationId }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.top}>
        <p className={styles.label}>{label}</p>
        {annotationId != null ? (
          <span className={styles.badge} aria-label={`Annotation ${annotationId}`}>
            {annotationId}
          </span>
        ) : null}
      </div>
      <div className={`${styles.line} ${flagged ? styles.lineFlagged : ""}`}>
        <p className={flagged ? styles.flag : styles.value}>{value}</p>
      </div>
    </div>
  );
}
