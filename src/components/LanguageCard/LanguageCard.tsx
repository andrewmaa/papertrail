import globeIcon from "../../assets/upload/globe.svg";
import logoMark from "../../assets/logo-mark.svg";
import styles from "./LanguageCard.module.css";

type LanguageCardProps = {
  language: string;
  confidence: string;
  documentId: string;
  detecting?: boolean;
};

export default function LanguageCard({
  language,
  confidence,
  documentId,
  detecting = false,
}: LanguageCardProps) {
  if (detecting) {
    return (
      <section className={`${styles.card} ${styles.detecting}`} aria-busy="true" aria-live="polite">
        <img src={logoMark} alt="" width={28} height={28} className={styles.spinner} />
        <p className={styles.detectingLabel}>Detecting language</p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Language detection">
      <span className={styles.iconWrap} aria-hidden="true">
        <img src={globeIcon} alt="" className={styles.icon} />
      </span>
      <div className={styles.copy}>
        <p className={styles.title}>Detected Language: {language}</p>
        <p className={styles.meta}>
          Confidence: {confidence} {"\u2022"} Document ID: {documentId}
        </p>
      </div>
    </section>
  );
}
