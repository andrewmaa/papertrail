import type { CSSProperties } from "react";
import styles from "./StepCard.module.css";

type StepCardProps = {
  step: number;
  title: string;
  body: string;
  total?: number;
};

export default function StepCard({ step, title, body, total = 7 }: StepCardProps) {
  return (
    <article
      className={styles.card}
      style={{ "--i": step - 1, "--progress": step / total } as CSSProperties}
    >
      <span className={styles.badge} aria-hidden="true">
        {step}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.fill} />
      </span>
    </article>
  );
}
