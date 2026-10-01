import styles from "./CheckList.module.css";

type CheckListProps = {
  items: string[];
};

export default function CheckList({ items }: CheckListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          <span className={styles.mark} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
