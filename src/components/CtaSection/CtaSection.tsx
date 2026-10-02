import Button from "../Button/Button";
import SectionPanel from "../SectionPanel/SectionPanel";
import styles from "./CtaSection.module.css";

export default function CtaSection() {
  return (
    <SectionPanel id="demo" tone="ink" className={styles.section}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Ready to digitize</p>
        <h2 className={styles.title}>Turn paper into trusted data.</h2>
        <p className={styles.description}>
          Start with one country, one currency, and a clear audit trail from intake to export.
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="inverseOutline" href="#how-it-works">
          How it Works
        </Button>
        {/* <Button variant="inverse" href="#demo">
          Request a Demo
        </Button> */}
        <Button variant="inverse" href="/dashboard">
          Try it out
        </Button>
      </div>
    </SectionPanel>
  );
}
