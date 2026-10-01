import styles from "./IconCallout.module.css";

type IconCalloutProps = {
  iconSrc: string;
  iconAlt?: string;
  title: string;
  body: string;
};

export default function IconCallout({
  iconSrc,
  iconAlt = "",
  title,
  body,
}: IconCalloutProps) {
  return (
    <aside className={styles.callout}>
      <div className={styles.content}>
        <div className={styles.orb}>
          <div className={styles.disc}>
            <img src={iconSrc} alt={iconAlt} width={72} height={72} className={styles.icon} />
          </div>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.body}>{body}</p>
      </div>
    </aside>
  );
}
