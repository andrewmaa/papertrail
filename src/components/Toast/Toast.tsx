import { useEffect } from "react";
import styles from "./Toast.module.css";

export type ToastStatus = "uploading" | "processing" | "success" | "error";

export type ToastItem = {
  id: string;
  status: ToastStatus;
  title: string;
  message?: string;
  progress?: number;
  action?: { label: string; onClick: () => void };
};

const AUTO_DISMISS_MS: Partial<Record<ToastStatus, number>> = {
  success: 6000,
};

type ToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const busy = toast.status === "uploading" || toast.status === "processing";

  useEffect(() => {
    const delay = AUTO_DISMISS_MS[toast.status];
    if (!delay) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), delay);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.status, onDismiss]);

  return (
    <li
      className={styles.toast}
      data-status={toast.status}
      role={toast.status === "error" ? "alert" : "status"}
      aria-busy={busy || undefined}
    >
      <span className={styles.indicator} aria-hidden="true">
        {toast.status === "success" ? "\u2713" : toast.status === "error" ? "!" : null}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message ? <p className={styles.message}>{toast.message}</p> : null}
        {toast.status === "uploading" ? (
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((toast.progress ?? 0) * 100)}
          >
            <span style={{ width: `${Math.round((toast.progress ?? 0) * 100)}%` }} />
          </div>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      {busy ? null : (
        <button
          type="button"
          className={styles.dismiss}
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
        >
          {"\u00d7"}
        </button>
      )}
    </li>
  );
}

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <ol className={styles.stack} aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </ol>
  );
}
