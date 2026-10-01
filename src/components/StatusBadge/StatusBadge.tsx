import type { ReactNode } from "react";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  tone?: "success";
  children: ReactNode;
};

export default function StatusBadge({ tone = "success", children }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
