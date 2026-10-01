import globeIcon from "../../assets/upload/globe.svg";
import styles from "./LanguageCard.module.css";

type LanguageCardProps = {
  language: string;
  confidence: string;
  documentId: string;
};

export default function LanguageCard({ language, confidence, documentId }: LanguageCardProps) {
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
