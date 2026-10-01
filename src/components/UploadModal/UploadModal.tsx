import { useEffect, useId, useRef, useState } from "react";
import Button from "../Button/Button";
import Dropzone from "../Dropzone/Dropzone";
import LanguageCard from "../LanguageCard/LanguageCard";
import OutputOptions, { type OutputPreference } from "../OutputOptions/OutputOptions";
import type { RecordDocument } from "../../data/records";
import styles from "./UploadModal.module.css";

const CLOSE_DURATION_MS = 280;

type UploadModalProps = {
  onClose: () => void;
  onProcessing: (record: RecordDocument) => void;
  onCreated: (record: RecordDocument) => void;
  onFailed: (id: string) => void;
};

type DetectedLanguage = {
  language: string;
  confidence: string;
  documentId: string;
};

function nextDocumentId() {
  return `PT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function placeholderRecord(files: File[], documentId: string): RecordDocument {
  const title = files[0]?.name.replace(/\.[^.]+$/, "") || "Untitled scan";
  return {
    id: documentId,
    type: "Letter",
    title,
    status: "Processing",
    pages: files.length || 1,
    box: "00",
    completionLabel: "In progress",
    fields: [],
    annotations: [],
    comments: [],
    sourcePreviewUrl: files[0] ? URL.createObjectURL(files[0]) : undefined,
  };
}

function fileFingerprint(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function UploadModal({
  onClose,
  onProcessing,
  onCreated,
  onFailed,
}: UploadModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [preference, setPreference] = useState<OutputPreference>("english");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedLanguage | null>(null);
  const [documentId, setDocumentId] = useState(() => nextDocumentId());

  const closingRef = useRef(false);
  const submittingRef = useRef(false);
  const closeTimerRef = useRef<number>(undefined);
  const detectAbortRef = useRef<AbortController | null>(null);
  const lastDetectedKeyRef = useRef<string | null>(null);

  const requestClose = (force = false) => {
    if (closingRef.current) return;
    if (submittingRef.current && !force) return;
    closingRef.current = true;
    setEntered(false);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimerRef.current = window.setTimeout(onClose, reduceMotion ? 0 : CLOSE_DURATION_MS);
  };
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    panelRef.current?.focus();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(closeTimerRef.current);
      detectAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestCloseRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      detectAbortRef.current?.abort();
      detectAbortRef.current = null;
      lastDetectedKeyRef.current = null;
      setDetecting(false);
      setDetectError(null);
      setDetected(null);
      setDocumentId(nextDocumentId());
      return;
    }

    const first = files[0];
    const key = fileFingerprint(first);
    if (lastDetectedKeyRef.current === key) return;

    detectAbortRef.current?.abort();
    const controller = new AbortController();
    detectAbortRef.current = controller;

    const id = documentId;
    setDetecting(true);
    setDetectError(null);
    setDetected(null);

    const body = new FormData();
    body.append("file", first);

    void (async () => {
      try {
        const response = await fetch("/api/detect-language", {
          method: "POST",
          body,
          signal: controller.signal,
        });
        const raw = await response.text();
        let payload: { language?: string; confidence?: string; error?: string } = {};
        if (raw) {
          try {
            payload = JSON.parse(raw) as typeof payload;
          } catch {
            throw new Error(
              response.ok
                ? "Invalid response from language API"
                : "API server unreachable — run npm run dev (starts web + API)",
            );
          }
        } else if (!response.ok) {
          throw new Error("API server unreachable — run npm run dev (starts web + API)");
        }
        if (!response.ok) {
          throw new Error(payload.error || "Language detection failed");
        }
        if (controller.signal.aborted) return;
        lastDetectedKeyRef.current = key;
        setDetected({
          language: payload.language ?? "Unknown",
          confidence: payload.confidence ?? "—",
          documentId: id,
        });
        setDetecting(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setDetecting(false);
        setDetectError(err instanceof Error ? err.message : "Language detection failed");
      }
    })();

    return () => {
      controller.abort();
    };
  }, [files, documentId]);

  async function handleCreate() {
    if (files.length === 0 || submittingRef.current) return;
    setError(null);
    submittingRef.current = true;
    setSubmitting(true);

    const pending = placeholderRecord(files, documentId);
    onProcessing(pending);

    const body = new FormData();
    for (const file of files) body.append("files", file);
    body.append("preference", preference);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body,
      });
      const raw = await response.text();
      let payload: RecordDocument & { error?: string };
      try {
        payload = JSON.parse(raw) as RecordDocument & { error?: string };
      } catch {
        throw new Error(
          response.ok
            ? "Invalid response from processing API"
            : "API server unreachable — run npm run dev (starts web + API)",
        );
      }
      if (!response.ok) {
        throw new Error(payload.error || "Processing failed");
      }

      const digitized: RecordDocument = {
        ...payload,
        id: pending.id,
        language: payload.language ?? detected?.language,
        confidence: payload.confidence ?? detected?.confidence,
        sourcePreviewUrl: pending.sourcePreviewUrl,
      };
      onCreated(digitized);
      submittingRef.current = false;
      setSubmitting(false);
      requestClose(true);
    } catch (err) {
      onFailed(pending.id);
      setError(err instanceof Error ? err.message : "Processing failed");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      data-entered={entered || undefined}
      role="presentation"
      onClick={() => requestClose()}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              Document Upload
            </h2>
            <p id={descriptionId} className={styles.subtitle}>
              Upload your files and manage language outputs seamlessly.
            </p>
          </div>
        </header>

        <div className={styles.body}>
          <Dropzone files={files} onFilesChange={setFiles} disabled={submitting} />
          {files.length > 0 ? (
            <>
              <LanguageCard
                language={
                  detecting ? "Detecting…" : detected?.language ?? (detectError ? "Unknown" : "Detecting…")
                }
                confidence={detecting ? "…" : detected?.confidence ?? "—"}
                documentId={documentId}
              />
              {detectError ? (
                <p className={styles.detectError} role="status">
                  Couldn’t detect language: {detectError}
                </p>
              ) : null}
              <OutputOptions value={preference} onChange={setPreference} />
            </>
          ) : null}
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <p className={styles.estimate}>
            {submitting
              ? "Sending pages to Claude Vision…"
              : detecting
                ? "Detecting document language…"
                : "Estimated processing time: under a minute"}
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              className={styles.create}
              disabled={files.length === 0 || submitting}
              onClick={handleCreate}
            >
              {submitting ? "Processing…" : "Create"}
            </Button>
          </div>
        </footer>
      </div>

      <p className={styles.dismissHint}>click anywhere to close</p>
    </div>
  );
}
