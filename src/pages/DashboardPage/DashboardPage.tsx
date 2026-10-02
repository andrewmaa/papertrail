import { useEffect, useMemo, useState } from "react";
import emptyBox from "../../assets/empty-box.svg";
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
import { type RecordDocument } from "../../data/records";
import { apiUrl, withApiAssetUrls } from "../../lib/api";
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
  const [records, setRecords] = useState<RecordDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<DocType>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusFilter>>(new Set());
  const [sort, setSort] = useState<SortOption>("Newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<RecordDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(apiUrl("/api/records"));
        const raw = await response.text();
        let payload: RecordDocument[] | { error?: string };
        try {
          payload = JSON.parse(raw) as RecordDocument[] | { error?: string };
        } catch {
          throw new Error(
            "API server unreachable — set VITE_API_URL on Vercel to https://papertrail-production-8139.up.railway.app and redeploy",
          );
        }
        if (!response.ok) {
          const err = payload as { error?: string };
          throw new Error(err.error || "Failed to load records");
        }
        if (!cancelled) {
          setRecords((payload as RecordDocument[]).map(withApiAssetUrls));
        }      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load records");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    const next = withApiAssetUrls(record);
    setRecords((prev) => [next, ...prev.filter((item) => item.id !== next.id)]);
  }

  function updateRecord(record: RecordDocument) {
    const next = withApiAssetUrls(record);
    setRecords((prev) => prev.map((item) => (item.id === next.id ? next : item)));
    setActiveRecord((current) => (current?.id === next.id ? next : current));
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

  async function deleteSelected() {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      const response = await fetch(apiUrl("/api/records"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const raw = await response.text();
      let payload: { deleted?: string[]; error?: string } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as { deleted?: string[]; error?: string };
        } catch {
          throw new Error("Invalid response from delete API");
        }
      }
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete records");
      }
      const deleted = new Set(payload.deleted ?? ids);
      setRecords((prev) => prev.filter((item) => !deleted.has(item.id)));
      setActiveRecord((current) =>
        current && deleted.has(current.id) ? null : current,
      );
      setSelectedIds(new Set());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to delete records");
    }
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
            <p className={styles.breadcrumb}>Archive / All records</p>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Your filing cabinet, in the cloud.</h1>
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
                  variant="danger"
                  className={styles.action}
                  disabled={selectedRecords.length === 0}
                  onClick={deleteSelected}
                >
                  Delete{selectedRecords.length > 0 ? ` (${selectedRecords.length})` : ""}
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
            </div>
          </header>

          {!loading && !loadError && records.length > 0 ? (
            <dl className={styles.stats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt className={styles.statValue}>{stat.value}</dt>
                  <dd className={styles.statLabel}>{stat.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {!loading && !loadError && records.length > 0 ? (
            <p className={styles.showing}>
              Showing {filtered.length} of {records.length} · sorted by {SORT_LABELS[sort]}
            </p>
          ) : null}

          {loading ? (
            <p className={styles.empty}>Loading records…</p>
          ) : loadError ? (
            <p className={styles.empty}>{loadError}</p>
          ) : records.length === 0 ? (
            <div className={styles.emptyState}>
              <img src={emptyBox} alt="" width={160} height={140} className={styles.emptyArt} />
              <p className={styles.emptyTitle}>Upload a file to get started</p>
              <p className={styles.emptyCopy}>
                Digitize your first document and it will show up here in your filing cabinet.
              </p>
              <Button
                variant="primary"
                className={styles.emptyAction}
                aria-haspopup="dialog"
                onClick={() => setUploadOpen(true)}
              >
                <span className={styles.uploadPlus} aria-hidden="true">
                  +
                </span>
                Upload new record
              </Button>
            </div>
          ) : filtered.length === 0 ? (
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
