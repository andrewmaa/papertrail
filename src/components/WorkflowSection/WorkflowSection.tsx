import SectionIntro from "../SectionIntro/SectionIntro";
import SectionPanel from "../SectionPanel/SectionPanel";
import StepCard from "../StepCard/StepCard";
import styles from "./WorkflowSection.module.css";

const STEPS_TOP = [
  {
    step: 1,
    title: "Collect",
    body: "Log incoming paper records and prepare batches for scanning.",
  },
  {
    step: 2,
    title: "Scan",
    body: "Capture documents in batches and rescan pages that need a second pass.",
  },
  {
    step: 3,
    title: "Extract",
    body: "Turn scans into structured data using OCR and table extraction.",
  },
  {
    step: 4,
    title: "Clean",
    body: "Standardize dates, units, and columns before export.",
  },
];

const STEPS_BOTTOM = [
  {
    step: 5,
    title: "Export",
    body: "Move clean data into spreadsheets, systems, or downstream tools.",
  },
  {
    step: 6,
    title: "Keep private",
    body: "Keep data on site with permissions, access tracking, and source checks.",
  },
  {
    step: 7,
    title: "Approve",
    body: "Review flagged items, confirm accuracy, and keep a complete audit record.",
  },
];

export default function WorkflowSection() {
  return (
    <SectionPanel id="how-it-works" className={styles.section}>
      <SectionIntro
        eyebrow="The workflow"
        title="From paper to trusted data in seven steps."
        description="One country, one currency, and a clear audit trail from intake to export."
      />
      <div className={styles.grid}>
        {STEPS_TOP.map((step) => (
          <StepCard key={step.step} {...step} />
        ))}
      </div>
      <div className={`${styles.grid} ${styles.gridBottom}`}>
        {STEPS_BOTTOM.map((step) => (
          <StepCard key={step.step} {...step} />
        ))}
      </div>
    </SectionPanel>
  );
}
