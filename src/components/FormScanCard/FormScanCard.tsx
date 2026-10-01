import FormField, { type FormFieldProps } from "../FormField/FormField";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./FormScanCard.module.css";

type FormScanCardProps = {
  title: string;
  status: string;
  fields: FormFieldProps[];
  summary: string;
  annotation?: string;
};

export default function FormScanCard({ title, status, fields, summary, annotation }: FormScanCardProps) {
  return (
    <div className={styles.stack}>
      <div className={styles.backSheet} aria-hidden="true" />
      <article className={styles.card} aria-label={title}>
        <header className={styles.header}>
          <p className={styles.title}>{title}</p>
          <StatusBadge>{status}</StatusBadge>
        </header>
        <div className={styles.fields}>
          {fields.map((field) => (
            <FormField key={field.label} {...field} />
          ))}
        </div>
        {annotation ? <p className={styles.annotation}>{annotation}</p> : null}
        <footer className={styles.footer}>
          <span className={styles.dot} aria-hidden="true" />
          <p className={styles.summary}>{summary}</p>
        </footer>
      </article>
    </div>
  );
}
