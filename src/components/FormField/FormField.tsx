import styles from "./FormField.module.css";

export type FormFieldProps = {
  label: string;
  value: string;
  flagged?: boolean;
};

export default function FormField({ label, value, flagged = false }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <p className={styles.label}>{label}</p>
      <div className={`${styles.line} ${flagged ? styles.lineFlagged : ""}`}>
        <p className={flagged ? styles.flag : styles.value}>{value}</p>
      </div>
    </div>
  );
}
