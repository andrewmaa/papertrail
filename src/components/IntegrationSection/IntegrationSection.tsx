import plug from "../../assets/plug.svg";
import CheckList from "../CheckList/CheckList";
import IconCallout from "../IconCallout/IconCallout";
import SectionPanel from "../SectionPanel/SectionPanel";
import styles from "./IntegrationSection.module.css";

const ITEMS = [
  "Spreadsheet exports for finance and operations teams",
  "API access for deeper integrations with existing systems",
  "A workflow that fits on-site consulting and internal operations",
];

export default function IntegrationSection() {
  return (
    <SectionPanel className={styles.section}>
      <IconCallout
        iconSrc={plug}
        title="Fit existing systems"
        body="Export clean data into spreadsheets, downstream tools, and internal systems without changing the client workflow."
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Integration</p>
        <h2 className={styles.title}>Clean data that fits the tools you already use.</h2>
        <p className={styles.description}>
          Papertrail is designed to support on-site consulting work and internal operations. Export
          clean data into spreadsheets, downstream tools, and internal systems without forcing a new
          workflow.
        </p>
        <CheckList items={ITEMS} />
      </div>
    </SectionPanel>
  );
}
