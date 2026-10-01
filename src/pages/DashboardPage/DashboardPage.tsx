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
import UploadModal from "../../components/UploadModal/UploadModal";
import { RECORDS, type RecordDocument } from "../../data/records";
import { exportRecordsAsCsv } from "../../lib/exportRecords";
import styles from "./DashboardPage.module.css";

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
  const [records, setRecords] = useState<RecordDocument[]>(RECORDS);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<DocType>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusFilter>>(new Set());
  const [sort, setSort] = useState<SortOption>("Newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<RecordDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const typeCounts = useMemo(() => {
    const counts: Record<DocType, number> = {
      Invoice: 0,
      Contract: 0,
      Medical: 0,
      Tax: 0,
      Letter: 0,
    };
    for (const record of records) counts[record.type] += 1;
    return counts;
  }, [records]);

  const stats = useMemo(() => {
    const pages = records.reduce((sum, record) => sum + record.pages, 0);
    const boxes = new Set(records.map((record) => record.box)).size;
    return [
      { value: String(records.length), label: "records" },
      { value: String(pages), label: "pages scanned" },
      { value: String(boxes), label: "boxes" },
    ];
  }, [records]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = records.filter((record) => {
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
  }, [records, search, selectedTypes, selectedStatuses, sort]);

  const selectedRecords = useMemo(
    () => records.filter((record) => selectedIds.has(record.id)),
    [records, selectedIds],
  );

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((record) => selectedIds.has(record.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const record of filtered) {
        if (allVisibleSelected) next.delete(record.id);
        else next.add(record.id);
      }
      return next;
    });
  }

  function addRecord(record: RecordDocument) {
    setRecords((prev) => [record, ...prev.filter((item) => item.id !== record.id)]);
  }

  function updateRecord(record: RecordDocument) {
    setRecords((prev) => prev.map((item) => (item.id === record.id ? record : item)));
    setActiveRecord((current) => (current?.id === record.id ? record : current));
  }

  function removeRecord(id: string) {
    setRecords((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setActiveRecord((current) => (current?.id === id ? null : current));
  }

  return (
    <div className={styles.page}>
      <NavBar search={{ value: search, onChange: setSearch }} />

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
            <div className={styles.actions}>
              <Button
                variant="outline"
                className={styles.action}
                aria-pressed={allVisibleSelected}
                disabled={filtered.length === 0}
                onClick={toggleSelectAll}
              >
                {allVisibleSelected ? "Deselect all" : "Select all"}
              </Button>
              <Button
                variant="outline"
                className={styles.action}
                disabled={selectedRecords.length === 0}
                onClick={() => exportRecordsAsCsv(selectedRecords)}
              >
                Export{selectedRecords.length > 0 ? ` (${selectedRecords.length})` : ""}
              </Button>
              <Button
                variant="primary"
                className={`${styles.action} ${styles.upload}`}
                aria-haspopup="dialog"
                onClick={() => setUploadOpen(true)}
              >
                <span className={styles.uploadPlus} aria-hidden="true">
                  +
                </span>
                Upload new record
              </Button>
            </div>
          </header>

          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statValue}>{stat.value}</dt>
                <dd className={styles.statLabel}>{stat.label}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.showing}>
            Showing {filtered.length} of {records.length} · sorted by {SORT_LABELS[sort]}
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
                    selected={selectedIds.has(record.id)}
                    onToggleSelect={() =>
                      setSelectedIds((prev) => toggleInSet(prev, record.id))
                    }
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

      {uploadOpen ? (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onProcessing={addRecord}
          onCreated={updateRecord}
          onFailed={removeRecord}
        />
      ) : null}
    </div>
  );
}
