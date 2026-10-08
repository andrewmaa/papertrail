import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import uploadIcon from "../../assets/upload/upload.svg";
import styles from "./Dropzone.module.css";

const ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/jpg", "application/pdf"]);

type DropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
};

function isAllowed(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(extension);
}

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "application/pdf") return "pdf";
  return "jpg";
}

function filesFromClipboard(data: DataTransfer | null): File[] {
  if (!data) return [];
  const fromFiles = Array.from(data.files ?? []).filter(isAllowed);
  if (fromFiles.length > 0) return fromFiles;

  const pasted: File[] = [];
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== "file" || !ALLOWED_TYPES.has(item.type)) continue;
    const file = item.getAsFile();
    if (!file) continue;
    if (file.name && isAllowed(file)) {
      pasted.push(file);
      continue;
    }
    const name = `pasted-${Date.now()}-${pasted.length + 1}.${extensionForType(item.type)}`;
    pasted.push(new File([file], name, { type: item.type || "image/png" }));
  }
  return pasted;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Dropzone({ files, onFilesChange, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(0);
  const titleId = useId();

  const addFileList = (incoming: File[]) => {
    if (disabled || incoming.length === 0) return;
    const accepted = incoming.filter(isAllowed);
    setRejected(incoming.length - accepted.length);
    if (accepted.length === 0) return;

    const current = filesRef.current;
    const existing = new Set(current.map((file) => `${file.name}-${file.size}`));
    const unique = accepted.filter((file) => !existing.has(`${file.name}-${file.size}`));
    if (unique.length === 0) return;
    onFilesChange([...current, ...unique]);
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    addFileList(Array.from(incoming));
  };

  useEffect(() => {
    if (disabled) return;

    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      const pasted = filesFromClipboard(event.clipboardData);
      if (pasted.length === 0) return;
      event.preventDefault();
      addFileList(pasted);
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [disabled, onFilesChange]);

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <section
      className={styles.zone}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      aria-labelledby={titleId}
      aria-disabled={disabled || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
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
      <p className={styles.hint}>or browse / paste from your computer (JPG, PNG, PDF)</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className={styles.input}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Upload
        </button>
        <p className={styles.pasteHint}>You can also paste an image with ⌘V / Ctrl+V</p>
      </div>

      <div aria-live="polite" className={styles.status}>
        {rejected > 0 ? (
          <p className={styles.error}>
            {rejected === 1 ? "1 file was skipped" : `${rejected} files were skipped`} — only JPG,
            PNG, and PDF are supported.
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
                disabled={disabled}
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
