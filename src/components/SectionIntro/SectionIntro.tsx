import styles from "./SectionIntro.module.css";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  size?: "lg" | "md";
  tone?: "default" | "inverse";
};

export default function SectionIntro({
  eyebrow,
  title,
  description,
  size = "lg",
  tone = "default",
}: SectionIntroProps) {
  return (
    <header className={[styles.intro, styles[size], styles[tone]].join(" ")}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
