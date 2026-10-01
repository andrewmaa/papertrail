import type { ReactNode } from "react";
import styles from "./SectionPanel.module.css";

type SectionPanelProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "ink";
};

export default function SectionPanel({
  id,
  children,
  className,
  tone = "paper",
}: SectionPanelProps) {
  return (
    <section
      id={id}
      className={[styles.panel, styles[tone], className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
