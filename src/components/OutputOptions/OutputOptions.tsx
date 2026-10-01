import checkIcon from "../../assets/upload/check.svg";
import styles from "./OutputOptions.module.css";

export type OutputPreference = "english" | "native" | "both";

type Option = {
  value: OutputPreference;
  title: string;
  description: string;
};

const OPTIONS: Option[] = [
  {
    value: "english",
    title: "English Translation",
    description:
      "Translate the document into English while preserving the original formatting and layout.",
  },
  {
    value: "native",
    title: "Native Language",
    description:
      "Keep the document in its original Japanese language. Ideal for internal regional workflows.",
  },
  {
    value: "both",
    title: "Both Outputs",
    description:
      "Generate both the translated English and native Japanese versions in a single workflow.",
  },
];

type OutputOptionsProps = {
  value: OutputPreference;
  onChange: (value: OutputPreference) => void;
};

export default function OutputOptions({ value, onChange }: OutputOptionsProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Select Output Preferences</legend>
      <div className={styles.grid}>
        {OPTIONS.map((option) => {
          const checked = option.value === value;
          return (
            <label key={option.value} className={styles.card} data-checked={checked || undefined}>
              <input
                type="radio"
                name="output-preference"
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className={styles.input}
              />
              <span className={styles.header}>
                <span className={styles.radio} aria-hidden="true" />
                <span className={styles.title}>{option.title}</span>
                {checked ? <img src={checkIcon} alt="" className={styles.check} /> : null}
              </span>
              <span className={styles.description}>{option.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
