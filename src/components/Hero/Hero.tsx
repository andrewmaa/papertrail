import brush from "../../assets/brush.svg";
import FormScanCard from "../FormScanCard/FormScanCard";
import styles from "./Hero.module.css";

const INTAKE_FIELDS = [
  { label: "Full name", value: "Margaret Okonkwo" },
  { label: "Date of birth", value: "14 / 03 / 1982" },
  { label: "Insurance ID", value: "HX-2291-004" },
  { label: "Signature", value: "⚠️ Missing — flagged for review", flagged: true, annotationId: 1 },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1 className={styles.headline}>
          Digitize records{" "}
          <span className={styles.underlined}>
            instantly.
            <img src={brush} alt="" width={429} height={21} className={styles.brush} />
          </span>
        </h1>
      </div>
      <div className={styles.illustration}>
        <FormScanCard
          title="Patient Intake Form"
          status="✓ Completed"
          fields={INTAKE_FIELDS}
          summary="3 of 4 fields extracted · 1 flagged"
        />
      </div>
    </section>
  );
}
