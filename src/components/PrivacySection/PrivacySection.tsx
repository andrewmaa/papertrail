import shield from "../../assets/shield.svg";
import CheckList from "../CheckList/CheckList";
import IconCallout from "../IconCallout/IconCallout";
import SectionPanel from "../SectionPanel/SectionPanel";
import styles from "./PrivacySection.module.css";

const ITEMS = [
  "Permissions for who can scan, review, and export",
  "Access tracking for every batch and every record",
  "Source checks so the original paper stays linked to the output",
];

export default function PrivacySection() {
  return (
    <SectionPanel className={styles.section}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>On-site privacy</p>
        <h2 className={styles.title}>Keep data on site with controlled access.</h2>
        <p className={styles.description}>
          Papertrail is built for organizations that cannot move sensitive records off site.
          Permissions, access tracking, and source checks stay close to the original paper so teams
          can digitize with confidence.
        </p>
        <CheckList items={ITEMS} />
      </div>
      <IconCallout
        iconSrc={shield}
        title="Controlled access"
        body="Keep sensitive records on site while still moving them into usable systems."
      />
    </SectionPanel>
  );
}
