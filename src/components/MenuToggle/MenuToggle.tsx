import styles from "./MenuToggle.module.css";

type MenuToggleProps = {
  open: boolean;
  controls: string;
  onToggle: () => void;
  className?: string;
};

export default function MenuToggle({ open, controls, onToggle, className }: MenuToggleProps) {
  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onToggle}
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </button>
  );
}
