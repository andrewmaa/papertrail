import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Button from "../Button/Button";
import {
  ExportVisual,
  ReviewVisual,
  SearchVisual,
  StatusVisual,
  UploadVisual,
  WelcomeVisual,
} from "./TutorialVisuals";
import styles from "./WelcomeTutorial.module.css";

export const TUTORIAL_STORAGE_KEY = "papertrail:tutorial-complete";
const CLOSE_DURATION_MS = 280;

type TutorialStep = {
  eyebrow: string;
  title: string;
  body: string;
  tips: string[];
  visual: ReactNode;
};

const STEPS: TutorialStep[] = [
  {
    eyebrow: "Welcome",
    title: "Your filing cabinet, now in the cloud.",
    body: "Papertrail turns boxes of paper records into searchable, structured data. Here’s a quick tour of how it works.",
    tips: ["Takes about a minute", "Revisit anytime from “Take the tour”"],
    visual: <WelcomeVisual />,
  },
  {
    eyebrow: "Step 1 · Upload",
    title: "Drop in a scan or PDF.",
    body: "Click “Upload new record” and drag your files in. We detect the document’s language automatically and let you choose how the output should look.",
    tips: ["Multi-page PDFs and photos both work", "Pick structured fields or a full transcript"],
    visual: <UploadVisual />,
  },
  {
    eyebrow: "Step 2 · Digitize",
    title: "Watch records move from paper to data.",
    body: "Each upload shows its status as it’s processed. Records go from Queued to Processing to Digitized — you can keep working while they finish.",
    tips: ["Status updates appear on each card", "Processing records can still be opened"],
    visual: <StatusVisual />,
  },
  {
    eyebrow: "Step 3 · Find",
    title: "Search, filter, and sort in seconds.",
    body: "Use the search bar to find records by title or ID. The sidebar narrows results by document type and status, and sorts by date, page count, or name.",
    tips: ["Combine filters to zero in fast", "Counts show how many of each type you have"],
    visual: <SearchVisual />,
  },
  {
    eyebrow: "Step 4 · Review",
    title: "Open a record to check the details.",
    body: "Click any card to see its extracted fields. Compare them with the original scan, correct anything that looks off, leave notes for your team, or share a link.",
    tips: ["Edit fields inline and save", "Toggle “Original” to view the source scan"],
    visual: <ReviewVisual />,
  },
  {
    eyebrow: "Step 5 · Export",
    title: "Take your data anywhere.",
    body: "Select the records you need — or select all — and export them to CSV for spreadsheets and downstream tools. Records you no longer need can be deleted the same way.",
    tips: ["Exports include every extracted field", "Selections persist while you filter"],
    visual: <ExportVisual />,
  },
];

type WelcomeTutorialProps = {
  onClose: () => void;
  onStartUpload: () => void;
};

export default function WelcomeTutorial({ onClose, onStartUpload }: WelcomeTutorialProps) {
  const titleId = useId();
  const bodyId = useId();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [entered, setEntered] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;

  const finish = (after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    } catch {
      // Storage can be unavailable (e.g. private mode); the tour simply shows again next time.
    }
    setEntered(false);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimerRef.current = window.setTimeout(
      () => {
        onClose();
        after?.();
      },
      reduceMotion ? 0 : CLOSE_DURATION_MS,
    );
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  const goTo = (next: number) => {
    if (next < 0 || next >= STEPS.length || next === index) return;
    setDirection(next > index ? "forward" : "back");
    setIndex(next);
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    primaryRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishRef.current();
      } else if (event.key === "ArrowRight") {
        goToRef.current(indexRef.current + 1);
      } else if (event.key === "ArrowLeft") {
        goToRef.current(indexRef.current - 1);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(closeTimerRef.current);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      className={styles.screen}
      data-entered={entered || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <header className={styles.topBar}>
        <span className={styles.counter} aria-live="polite">
          {String(index + 1).padStart(2, "0")}
          <span className={styles.counterTotal}> / {String(STEPS.length).padStart(2, "0")}</span>
        </span>
        <button type="button" className={styles.skip} onClick={() => finish()}>
          Skip tour
        </button>
      </header>

      <div className={styles.stage}>
        <div key={index} className={styles.copy} data-direction={direction}>
          <p className={styles.eyebrow}>{step.eyebrow}</p>
          <h2 id={titleId} className={styles.title}>
            {step.title}
          </h2>
          <p id={bodyId} className={styles.body}>
            {step.body}
          </p>
          <ul className={styles.tips}>
            {step.tips.map((tip) => (
              <li key={tip} className={styles.tip}>
                <span className={styles.tipMark} aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div
          key={`visual-${index}`}
          className={styles.visual}
          data-direction={direction}
          aria-hidden="true"
        >
          {step.visual}
        </div>
      </div>

      <footer className={styles.footer}>
        <nav className={styles.dots} aria-label="Tutorial steps">
          {STEPS.map((item, dotIndex) => (
            <button
              key={item.eyebrow}
              type="button"
              className={styles.dot}
              data-active={dotIndex === index || undefined}
              data-done={dotIndex < index || undefined}
              aria-label={`Go to ${item.eyebrow}`}
              aria-current={dotIndex === index ? "step" : undefined}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </nav>

        <div className={styles.controls}>
          {isFirst ? null : (
            <Button variant="outline" className={styles.control} onClick={() => goTo(index - 1)}>
              Back
            </Button>
          )}
          {isLast ? (
            <>
              <Button variant="outline" className={styles.control} onClick={() => finish()}>
                Explore archive
              </Button>
              <Button
                ref={primaryRef}
                variant="primary"
                className={styles.control}
                onClick={() => finish(onStartUpload)}
              >
                Upload first record
              </Button>
            </>
          ) : (
            <Button
              ref={primaryRef}
              variant="primary"
              className={styles.control}
              onClick={() => goTo(index + 1)}
            >
              {isFirst ? "Start the tour" : "Next"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
