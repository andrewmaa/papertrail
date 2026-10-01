import type { CSSProperties } from "react";
import styles from "./CardArt.module.css";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.frame} aria-hidden="true">
      {children}
    </div>
  );
}

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

export function ArchiveArt() {
  return (
    <Frame>
      <div className={styles.archive}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.sheet} style={delay(i)}>
            <span className={styles.line} />
            <span className={`${styles.line} ${styles.short}`} />
            <span className={styles.line} />
          </div>
        ))}
        <span className={styles.chip}>
          <span className={styles.dot} />
          On site
        </span>
      </div>
    </Frame>
  );
}

const BARS = [38, 56, 44, 72, 88];

export function ChartArt() {
  return (
    <Frame>
      <div className={styles.chart}>
        {BARS.map((h, i) => (
          <span
            key={h}
            className={`${styles.bar} ${i === BARS.length - 1 ? styles.barStrong : ""}`}
            style={{ ...delay(i), height: `${h}%` }}
          />
        ))}
        <span className={`${styles.chip} ${styles.chipFloat}`}>Verified</span>
      </div>
    </Frame>
  );
}

const PEOPLE = ["MO", "JK", "AL"];

export function TeamArt() {
  return (
    <Frame>
      <div className={styles.team}>
        <div className={styles.avatars}>
          {PEOPLE.map((p, i) => (
            <span key={p} className={styles.avatar} style={delay(i)}>
              {p}
            </span>
          ))}
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={styles.cell} style={delay(i)} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function FlaggedArt() {
  return (
    <Frame>
      <div className={styles.form}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${styles.row} ${i === 2 ? styles.flagged : ""}`}>
            <span className={styles.label} />
            <span className={styles.value} />
            {i === 2 && <span className={styles.flag}>62%</span>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function SourceArt() {
  return (
    <Frame>
      <div className={styles.source}>
        <div className={styles.paper}>
          <span className={styles.line} />
          <span className={`${styles.line} ${styles.hl}`} />
          <span className={`${styles.line} ${styles.short}`} />
        </div>
        <div className={styles.link}>
          <span className={styles.traveler} />
        </div>
        <div className={styles.table}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`${styles.tr} ${i === 1 ? styles.hl : ""}`} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

const TRAIL = [
  { label: "Scanned", time: "09:12" },
  { label: "Corrected", time: "09:40" },
  { label: "Approved", time: "10:05" },
];

export function TrailArt() {
  return (
    <Frame>
      <ol className={styles.trail}>
        {TRAIL.map((t, i) => (
          <li
            key={t.label}
            className={`${styles.step} ${i === TRAIL.length - 1 ? styles.done : ""}`}
            style={delay(i)}
          >
            <span className={styles.node} />
            <span className={styles.stepLabel}>{t.label}</span>
            <span className={styles.time}>{t.time}</span>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
