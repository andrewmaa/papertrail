import { useEffect, useId, useRef, useState } from "react";
import Button from "../Button/Button";
import Dropzone from "../Dropzone/Dropzone";
import LanguageCard from "../LanguageCard/LanguageCard";
import OutputOptions, { type OutputPreference } from "../OutputOptions/OutputOptions";
import styles from "./UploadModal.module.css";

const CLOSE_DURATION_MS = 280;

type UploadModalProps = {
  onClose: () => void;
};

export default function UploadModal({ onClose }: UploadModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [preference, setPreference] = useState<OutputPreference>("english");

  const closingRef = useRef(false);
  const closeTimerRef = useRef<number>(undefined);

  const requestClose = () => {
    if (closingRef.current) return;
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

  return (
    <div
      className={styles.overlay}
      data-entered={entered || undefined}
      role="presentation"
      onClick={requestClose}
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
          <button
            type="button"
            className={styles.close}
            aria-label="Close upload"
            onClick={requestClose}
          >
            <span aria-hidden="true">{"\u00d7"}</span>
          </button>
        </header>

        <div className={styles.body}>
          <Dropzone files={files} onFilesChange={setFiles} />
          <LanguageCard language="Japanese" confidence="98.4%" documentId="PT-8392" />
          <OutputOptions value={preference} onChange={setPreference} />
        </div>

        <footer className={styles.footer}>
          <p className={styles.estimate}>Estimated processing time: 2-5 minutes</p>
          <div className={styles.actions}>
            <Button variant="outline" className={styles.return} onClick={requestClose}>
              Return
            </Button>
            <Button
              variant="primary"
              className={styles.create}
              disabled={files.length === 0}
              onClick={requestClose}
            >
              Create
            </Button>
          </div>
        </footer>
      </div>

      <p className={styles.dismissHint}>click anywhere to close</p>
    </div>
  );
}
