import { useState, type FormEvent } from "react";
import chevronIcon from "../../assets/icons/chevron.svg";
import type { Annotation, Comment, NoteAuthor } from "../../data/records";
import styles from "./NotesPanel.module.css";

type NotesPanelProps = {
  open: boolean;
  noteTotal: number;
  annotations: Annotation[];
  comments: Comment[];
  onClose: () => void;
  onPostComment: (body: string) => void;
};

function Avatar({ author }: { author: NoteAuthor }) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {author.initials}
    </span>
  );
}

export default function NotesPanel({
  open,
  noteTotal,
  annotations,
  comments,
  onClose,
  onPostComment,
}: NotesPanelProps) {
  const [draft, setDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    onPostComment(body);
    setDraft("");
  };

  return (
    <aside
      className={styles.panel}
      data-open={open || undefined}
      aria-hidden={!open}
      aria-label="Notes"
      onClick={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>
          Notes <span className={styles.count}>{noteTotal}</span>
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close notes">
          ×
        </button>
      </header>

      <div className={styles.body}>
        <p className={styles.sectionLabel}>Annotations · {annotations.length}</p>
        <div className={styles.annotationList}>
          {annotations.map((item) => (
            <article key={item.id} className={styles.annotationCard}>
              <div className={styles.annotationMeta}>
                <span className={styles.badge}>{item.id}</span>
                <span className={styles.fieldLabel}>{item.fieldLabel}</span>
                <span className={styles.fieldValue}>“{item.fieldValue}”</span>
              </div>
              <div className={styles.thread}>
                <Avatar author={item.author} />
                <div className={styles.threadCopy}>
                  <p className={styles.authorLine}>
                    <span className={styles.authorName}>{item.author.name}</span>
                    <span className={styles.authorTime}> · {item.time}</span>
                  </p>
                  <p className={styles.threadBody}>{item.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.sectionLabel}>Comments · {comments.length}</p>
        <div className={styles.commentList}>
          {comments.map((item) => (
            <div key={item.id} className={styles.thread}>
              <Avatar author={item.author} />
              <div className={styles.threadCopy}>
                <p className={styles.authorLine}>
                  <span className={styles.authorName}>{item.author.name}</span>
                  <span className={styles.authorTime}> · {item.time}</span>
                </p>
                <p className={styles.threadBody}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        className={styles.composer}
        data-collapsed={!composerOpen || undefined}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className={styles.scope}
          aria-expanded={composerOpen}
          aria-controls="record-comment-fields"
          onClick={() => setComposerOpen((value) => !value)}
        >
          <span>Comment on whole record</span>
          <img
            src={chevronIcon}
            alt=""
            width={13.867}
            height={8.32}
            className={styles.scopeChevron}
          />
        </button>
        <div
          id="record-comment-fields"
          className={styles.composerFields}
          aria-hidden={!composerOpen}
        >
          <div className={styles.composerFieldsInner}>
            <textarea
              className={styles.textarea}
              placeholder="Leave a note…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              tabIndex={composerOpen ? 0 : -1}
            />
            <button type="submit" className={styles.post} disabled={!draft.trim()}>
              Post comment
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
