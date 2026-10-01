import styles from "./InfoCard.module.css";

type InfoCardProps = {
  title: string;
  body: string;
};

export default function InfoCard({ title, body }: InfoCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </article>
  );
}
