import { useEffect, useId, useRef, useState } from "react";
import editIcon from "../../assets/icons/edit.svg";
import notesIcon from "../../assets/icons/notes.svg";
import shareIcon from "../../assets/icons/share.svg";
import { type Comment, type RecordDocument } from "../../data/records";
import Button from "../Button/Button";
import NotesPanel from "./NotesPanel";
import SharePanel from "./SharePanel";
import styles from "./DocumentViewer.module.css";

type DocumentViewerProps = {
  record: RecordDocument;
  onClose: () => void;
};

const CLOSE_DURATION_MS = 280;

const COMPLETION_TONE: Record<string, string> = {
  Completed: "completed",
  "In progress": "progress",
  Queued: "queued",
};

export default function DocumentViewer({ record, onClose }: DocumentViewerProps) {
  const titleId = useId();
  const shareId = useId();
  const [notesOpen, setNotesOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [comments, setComments] = useState<Comment[]>(record.comments);
  const [fields, setFields] = useState(record.fields);
  const [draft, setDraft] = useState(record.fields);
  const [editing, setEditing] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number>(undefined);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setNotesOpen(false);
    setShareOpen(false);
    setEntered(false);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimerRef.current = window.setTimeout(onClose, reduceMotion ? 0 : CLOSE_DURATION_MS);
  };
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    closingRef.current = false;
    setComments(record.comments);
    setFields(record.fields);
    setDraft(record.fields);
    setEditing(false);
    setNotesOpen(true);
    setShareOpen(false);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [record]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if ((notesOpen || shareOpen) && window.matchMedia("(max-width: 900px)").matches) {
          setNotesOpen(false);
          setShareOpen(false);
          return;
        }
        requestCloseRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [notesOpen, shareOpen]);

  const extracted = fields.length;

  const startEditing = () => {
    setDraft(fields);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(fields);
    setEditing(false);
  };

  const applyEditing = () => {
    setFields(draft.map((field) => ({ ...field, label: field.label.trim() || "Untitled", value: field.value.trim() })));
    setEditing(false);
  };

  const updateDraft = (index: number, key: "label" | "value", text: string) => {
    setDraft((prev) => prev.map((field, i) => (i === index ? { ...field, [key]: text } : field)));
  };
  const totalNotes = record.annotations.length + comments.length;
  const tone = COMPLETION_TONE[record.completionLabel] ?? "completed";

  const handlePostComment = (body: string) => {
    setComments((prev) => [
      {
        id: `local-${Date.now()}`,
        author: { initials: "YO", name: "You" },
        time: "Just now",
        body,
      },
      ...prev,
    ]);
  };

  return (
    <div
      className={styles.overlay}
      data-entered={entered || undefined}
      data-notes={notesOpen || shareOpen || undefined}
      role="presentation"
      onClick={requestClose}
    >
      <div
        className={styles.stage}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.toolbar} role="toolbar" aria-label="Record actions">
          <button
            type="button"
            className={`${styles.tool} ${styles.toolActive}`}
            aria-pressed={editing}
            onClick={editing ? cancelEditing : startEditing}
          >
            <img
              src={editIcon}
              alt=""
              width={17.678}
              height={17.678}
              className={styles.notesIcon}
              data-active={editing || undefined}
            />
            Edit
          </button>
          <button
            type="button"
            className={`${styles.tool} ${styles.toolActive}`}
            aria-pressed={shareOpen}
            aria-expanded={shareOpen}
            aria-controls={shareId}
            onClick={() => {
              setShareOpen((open) => !open);
              setNotesOpen(false);
            }}
          >
            <img
              src={shareIcon}
              alt=""
              width={17.678}
              height={17.678}
              className={styles.notesIcon}
              data-active={shareOpen || undefined}
            />
            Share
          </button>
          <button
            type="button"
            className={`${styles.tool} ${styles.toolActive}`}
            aria-pressed={notesOpen}
            onClick={() => {
              setNotesOpen((open) => !open);
              setShareOpen(false);
            }}
          >
            <img
              src={notesIcon}
              alt=""
              width={17.678}
              height={17.678}
              className={styles.notesIcon}
              data-active={notesOpen || undefined}
            />
            Notes
            <span className={styles.toolCount}>{totalNotes}</span>
          </button>
        </div>

        <article className={styles.sheet}>
          <header className={styles.sheetHeader}>
            <div className={styles.sheetHeading}>
              <h2 id={titleId} className={styles.sheetTitle}>
                {record.title}
              </h2>
              <p className={styles.sheetMeta}>
                {record.id} · {record.status}
              </p>
            </div>
            <span className={`${styles.completion} ${styles[tone]}`}>
              {record.completionLabel === "Completed" ? "✓ " : ""}
              {record.completionLabel}
            </span>
          </header>

          <div className={styles.fields} data-editing={editing || undefined}>
            {(editing ? draft : fields).map((field, index) => (
              <div key={index} className={styles.field}>
                <div className={styles.fieldTop}>
                  {editing ? (
                    <input
                      className={`${styles.fieldLabel} ${styles.fieldInput}`}
                      value={field.label}
                      onChange={(event) => updateDraft(index, "label", event.target.value)}
                      aria-label={`Field ${index + 1} header`}
                    />
                  ) : (
                    <p className={styles.fieldLabel}>{field.label}</p>
                  )}
                  {field.annotationId != null ? (
                    <button
                      type="button"
                      className={styles.fieldBadge}
                      onClick={() => {
                        setNotesOpen(true);
                        setShareOpen(false);
                      }}
                      aria-label={`Open annotation ${field.annotationId}`}
                    >
                      {field.annotationId}
                    </button>
                  ) : null}
                </div>
                <div className={styles.fieldValueRow}>
                  {editing ? (
                    <input
                      className={`${styles.fieldValue} ${styles.fieldInput}`}
                      value={field.value}
                      onChange={(event) => updateDraft(index, "value", event.target.value)}
                      aria-label={`${field.label || `Field ${index + 1}`} value`}
                    />
                  ) : (
                    <p className={styles.fieldValue}>{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editing ? (
            <footer className={`${styles.footer} ${styles.editFooter}`}>
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={applyEditing}>Apply</Button>
            </footer>
          ) : (
            <footer className={styles.footer}>
              <span className={styles.footerDot} aria-hidden="true" />
              <p className={styles.footerText}>
                {extracted} of {extracted} fields extracted
              </p>
            </footer>
          )}
        </article>
      </div>

      <NotesPanel
        open={notesOpen}
        noteTotal={totalNotes}
        annotations={record.annotations}
        comments={comments}
        onClose={() => setNotesOpen(false)}
        onPostComment={handlePostComment}
      />
      <SharePanel
        id={shareId}
        open={shareOpen}
        recordId={record.id}
        onClose={() => setShareOpen(false)}
      />

      <p className={styles.dismissHint}>click anywhere to close</p>
    </div>
  );
}
