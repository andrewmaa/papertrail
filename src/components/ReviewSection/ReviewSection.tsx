import InfoCard from "../InfoCard/InfoCard";
import SectionIntro from "../SectionIntro/SectionIntro";
import SectionPanel from "../SectionPanel/SectionPanel";
import styles from "./ReviewSection.module.css";

const CARDS = [
  {
    title: "Flagged items",
    body: "OCR and table extraction flag uncertain fields so reviewers know exactly where to look.",
  },
  {
    title: "Source checks",
    body: "Keep the original paper linked to the output so reviewers can verify accuracy quickly.",
  },
  {
    title: "Approval trail",
    body: "Capture who reviewed, what changed, and when the record was approved.",
  },
];

export default function ReviewSection() {
  return (
    <SectionPanel id="enterprise" className={styles.section}>
      <SectionIntro
        eyebrow="Human review"
        title="Machines extract; people confirm."
        description="Papertrail flags uncertain items so reviewers can check, correct, and approve before data moves downstream."
      />
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </div>
    </SectionPanel>
  );
}
