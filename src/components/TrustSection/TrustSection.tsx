import InfoCard from "../InfoCard/InfoCard";
import SectionIntro from "../SectionIntro/SectionIntro";
import SectionPanel from "../SectionPanel/SectionPanel";
import styles from "./TrustSection.module.css";
import { ArchiveArt, ChartArt, TeamArt } from "../CardArt/CardArt";

const ARTS = [<ArchiveArt key="a" />, <ChartArt key="c" />, <TeamArt key="t" />];

const CARDS = [
  {
    title: "Ministries",
    body: "Own the records, define access rules, and keep audit-ready data on site.",
  },
  {
    title: "Private firms & banks",
    body: "Get trustworthy figures across formats so finance, compliance, and operations can act with confidence.",
  },
  {
    title: "Consulting teams",
    body: "Work on site with clients, fit into existing tools, and deliver clean data without changing the underlying workflow.",
  },
];

export default function TrustSection() {
  return (
    <SectionPanel id="platform" className={styles.section}>
      <SectionIntro
        eyebrow="Trustworthy data"
        title="Reliable figures across formats."
        description="Papertrail helps ministries, firms, banks, and consultants turn messy paper into usable data that fits existing systems."
      />
      <div className={styles.grid}>
        {CARDS.map((card, i) => (
          <InfoCard key={card.title} {...card} index={i} art={ARTS[i]} />
        ))}
      </div>
    </SectionPanel>
  );
}
