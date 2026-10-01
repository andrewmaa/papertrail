import styles from "./FilterSidebar.module.css";

export type DocType = "Invoice" | "Contract" | "Medical" | "Tax" | "Letter";
export type SortOption = "Newest" | "Oldest" | "Most pages" | "A-Z";
export type StatusFilter = "Digitized" | "Processing" | "Queued";

type FilterSidebarProps = {
  selectedTypes: Set<DocType>;
  onToggleType: (type: DocType) => void;
  selectedStatuses: Set<StatusFilter>;
  onToggleStatus: (status: StatusFilter) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  typeCounts: Record<DocType, number>;
};

const DOC_TYPES: DocType[] = ["Invoice", "Contract", "Medical", "Tax", "Letter"];
const STATUSES: { label: StatusFilter; tone: string }[] = [
  { label: "Digitized", tone: "digitized" },
  { label: "Processing", tone: "processing" },
  { label: "Queued", tone: "queued" },
];
const SORT_OPTIONS: SortOption[] = ["Newest", "Oldest", "Most pages", "A-Z"];

export default function FilterSidebar({
  selectedTypes,
  onToggleType,
  selectedStatuses,
  onToggleStatus,
  sort,
  onSortChange,
  typeCounts,
}: FilterSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Filter and sort">
      <h2 className={styles.heading}>Filter and Sort</h2>
      <div className={styles.rule} aria-hidden="true" />

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Document type</legend>
        <ul className={styles.typeList}>
          {DOC_TYPES.map((type) => (
            <li key={type}>
              <label className={styles.typeRow}>
                <span className={styles.typeLeft}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedTypes.has(type)}
                    onChange={() => onToggleType(type)}
                  />
                  <span className={styles.typeName}>{type}</span>
                </span>
                <span className={styles.count}>{typeCounts[type]}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Status</legend>
        <div className={styles.statusList}>
          {STATUSES.map(({ label, tone }) => (
            <button
              key={label}
              type="button"
              className={styles.statusChip}
              aria-pressed={selectedStatuses.has(label)}
              data-active={selectedStatuses.has(label) || undefined}
              onClick={() => onToggleStatus(label)}
            >
              <span className={`${styles.statusDot} ${styles[tone]}`} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Sort by</legend>
        <div className={styles.sortGrid} role="group" aria-label="Sort by">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.sortButton}
              aria-pressed={sort === option}
              data-active={sort === option || undefined}
              onClick={() => onSortChange(option)}
            >
              {option === "A-Z" ? "A–Z" : option}
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
