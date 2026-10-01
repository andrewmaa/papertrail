import { useId, useRef, useState, type DragEvent } from "react";
import uploadIcon from "../../assets/upload/upload.svg";
import styles from "./Dropzone.module.css";

const ACCEPT = ".pdf,.docx,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg";
const ALLOWED_EXTENSIONS = ["pdf", "docx", "jpg", "jpeg"];

type DropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

function isAllowed(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(extension);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Dropzone({ files, onFilesChange }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(0);
  const titleId = useId();

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const accepted = list.filter(isAllowed);
    setRejected(list.length - accepted.length);
    if (accepted.length === 0) return;

    const existing = new Set(files.map((file) => `${file.name}-${file.size}`));
    const unique = accepted.filter((file) => !existing.has(`${file.name}-${file.size}`));
    onFilesChange([...files, ...unique]);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <section
      className={styles.zone}
      data-dragging={dragging || undefined}
      aria-labelledby={titleId}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <img src={uploadIcon} alt="" className={styles.icon} />
      </span>
      <h2 id={titleId} className={styles.title}>
        Drag and drop your files here
      </h2>
      <p className={styles.hint}>or browse from your computer (PDF, DOCX, JPG)</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className={styles.input}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <button type="button" className={styles.button} onClick={() => inputRef.current?.click()}>
        Upload
      </button>

      <div aria-live="polite" className={styles.status}>
        {rejected > 0 ? (
          <p className={styles.error}>
            {rejected === 1 ? "1 file was skipped" : `${rejected} files were skipped`} — only PDF,
            DOCX, and JPG are supported.
          </p>
        ) : null}
      </div>

      {files.length > 0 ? (
        <ul className={styles.files} aria-label="Selected files">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className={styles.file}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${file.name}`}
                onClick={() => onFilesChange(files.filter((item) => item !== file))}
              >
                {"\u00d7"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
