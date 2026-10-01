import styles from "./StepCard.module.css";

type StepCardProps = {
  step: number;
  title: string;
  body: string;
};

export default function StepCard({ step, title, body }: StepCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.badge} aria-hidden="true">
        {step}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </article>
  );
}
