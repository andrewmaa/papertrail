import { useMemo, useState } from "react";
import Button from "../../components/Button/Button";
import DocumentViewer from "../../components/DocumentViewer/DocumentViewer";
import FilterSidebar, {
  type DocType,
  type SortOption,
  type StatusFilter,
} from "../../components/FilterSidebar/FilterSidebar";
import NavBar from "../../components/NavBar/NavBar";
import RecordCard from "../../components/RecordCard/RecordCard";
import { RECORDS, type RecordDocument } from "../../data/records";
import styles from "./DashboardPage.module.css";

const STATS = [
  { value: "9", label: "records" },
  { value: "252", label: "pages scanned" },
  { value: "7", label: "boxes shredded" },
];

const SORT_LABELS: Record<SortOption, string> = {
  Newest: "newest",
  Oldest: "oldest",
  "Most pages": "most pages",
  "A-Z": "A\u2013Z",
};

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<DocType>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusFilter>>(new Set());
  const [sort, setSort] = useState<SortOption>("Newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<RecordDocument | null>(null);

  const typeCounts = useMemo(() => {
    const counts: Record<DocType, number> = {
      Invoice: 0,
      Contract: 0,
      Medical: 0,
      Tax: 0,
      Letter: 0,
    };
    for (const record of RECORDS) counts[record.type] += 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = RECORDS.filter((record) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(record.type)) return false;
      if (selectedStatuses.size > 0 && !selectedStatuses.has(record.status)) return false;
      if (!query) return true;
      return (
        record.title.toLowerCase().includes(query) ||
        record.id.toLowerCase().includes(query)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "Oldest":
          return a.id.localeCompare(b.id);
        case "Most pages":
          return b.pages - a.pages;
        case "A-Z":
          return a.title.localeCompare(b.title);
        case "Newest":
        default:
          return b.id.localeCompare(a.id);
      }
    });

    return list;
  }, [search, selectedTypes, selectedStatuses, sort]);

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.filterToggle}
          aria-expanded={filtersOpen}
          aria-controls="dashboard-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? "Hide filters" : "Filter and Sort"}
        </button>
      </div>

      <div className={styles.layout}>
        <div
          id="dashboard-filters"
          className={styles.sidebarSlot}
          data-open={filtersOpen || undefined}
        >
          <FilterSidebar
            search={search}
            onSearchChange={setSearch}
            selectedTypes={selectedTypes}
            onToggleType={(type) => setSelectedTypes((prev) => toggleInSet(prev, type))}
            selectedStatuses={selectedStatuses}
            onToggleStatus={(status) =>
              setSelectedStatuses((prev) => toggleInSet(prev, status))
            }
            sort={sort}
            onSortChange={setSort}
            typeCounts={typeCounts}
          />
        </div>

        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerCopy}>
              <p className={styles.breadcrumb}>Archive / All records</p>
              <h1 className={styles.title}>Your filing cabinet, in the cloud.</h1>
            </div>
            <Button variant="primary" href="/upload" className={styles.upload}>
              <span className={styles.uploadPlus} aria-hidden="true">
                +
              </span>
              Upload new record
            </Button>
          </header>

          <dl className={styles.stats}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statValue}>{stat.value}</dt>
                <dd className={styles.statLabel}>{stat.label}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.showing}>
            Showing {filtered.length} of {RECORDS.length} · sorted by {SORT_LABELS[sort]}
          </p>

          {filtered.length === 0 ? (
            <p className={styles.empty}>No records match your filters.</p>
          ) : (
            <ul className={styles.grid}>
              {filtered.map((record) => (
                <li key={record.id}>
                  <RecordCard
                    id={record.id}
                    type={record.type}
                    title={record.title}
                    status={record.status}
                    pages={record.pages}
                    box={record.box}
                    onOpen={() => setActiveRecord(record)}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {activeRecord ? (
        <DocumentViewer record={activeRecord} onClose={() => setActiveRecord(null)} />
      ) : null}
    </div>
  );
}
