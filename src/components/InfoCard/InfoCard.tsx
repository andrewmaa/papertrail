import type { CSSProperties, ReactNode } from "react";
import styles from "./InfoCard.module.css";

type InfoCardProps = {
  title: string;
  body: string;
  art?: ReactNode;
  index?: number;
};

export default function InfoCard({ title, body, art, index = 0 }: InfoCardProps) {
  return (
    <article className={styles.card} style={{ "--i": index } as CSSProperties}>
      {art}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </article>
  );
}
