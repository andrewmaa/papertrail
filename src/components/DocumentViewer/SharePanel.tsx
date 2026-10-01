import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import styles from "./SharePanel.module.css";

type Role = "Can view" | "Can comment" | "Can edit";
type LinkAccess = "Restricted" | "Anyone with the link";

type Person = {
  email: string;
  role: Role | "Owner";
};

type SharePanelProps = {
  id: string;
  open: boolean;
  recordId: string;
  onClose: () => void;
};

const ROLES: Role[] = ["Can view", "Can comment", "Can edit"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initialsFor(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

export default function SharePanel({ id, open, recordId, onClose }: SharePanelProps) {
  const emailId = useId();
  const accessId = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Can view");
  const [error, setError] = useState("");
  const [people, setPeople] = useState<Person[]>([{ email: "you", role: "Owner" }]);
  const [linkAccess, setLinkAccess] = useState<LinkAccess>("Restricted");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  const shareUrl = `${window.location.origin}/records/${encodeURIComponent(recordId)}`;

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    if (people.some((person) => person.email === value)) {
      setError("This person already has access.");
      return;
    }
    setPeople((prev) => [...prev, { email: value, role }]);
    setEmail("");
    setError("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <aside
      id={id}
      className={styles.panel}
      data-open={open || undefined}
      aria-label="Share record"
      inert={!open}
      onClick={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>
          Share <span className={styles.recordId}>{recordId}</span>
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close share">
          ×
        </button>
      </header>

      <div className={styles.body}>

          <form className={styles.invite} onSubmit={handleInvite} noValidate>
            <label htmlFor={emailId} className={styles.srOnly}>
              Email address
            </label>
            <input
              id={emailId}
              type="email"
              className={styles.input}
              placeholder="Add people by email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${emailId}-error` : undefined}
              autoComplete="email"
            />
            <select
              className={styles.select}
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              aria-label="Permission for invitee"
            >
              {ROLES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <button type="submit" className={styles.primary}>
              Invite
            </button>
          </form>
          {error ? (
            <p id={`${emailId}-error`} className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <ul className={styles.people} aria-label="People with access">
            {people.map((person) => (
              <li key={person.email} className={styles.person}>
                <span className={styles.avatar} aria-hidden="true">
                  {person.role === "Owner" ? "YO" : initialsFor(person.email)}
                </span>
                <span className={styles.personName}>
                  {person.role === "Owner" ? "You" : person.email}
                </span>
                {person.role === "Owner" ? (
                  <span className={styles.ownerTag}>Owner</span>
                ) : (
                  <select
                    className={styles.inlineSelect}
                    value={person.role}
                    aria-label={`Permission for ${person.email}`}
                    onChange={(event) => {
                      const next = event.target.value as Role;
                      setPeople((prev) =>
                        prev.map((p) => (p.email === person.email ? { ...p, role: next } : p)),
                      );
                    }}
                  >
                    {ROLES.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>

          <div className={styles.linkRow}>
            <div className={styles.linkAccess}>
              <label htmlFor={accessId} className={styles.linkLabel}>
                General access
              </label>
              <select
                id={accessId}
                className={styles.inlineSelect}
                value={linkAccess}
                onChange={(event) => setLinkAccess(event.target.value as LinkAccess)}
              >
                <option>Restricted</option>
                <option>Anyone with the link</option>
              </select>
            </div>
            <button
              type="button"
              className={styles.copy}
              onClick={handleCopy}
              data-copied={copied || undefined}
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
          <span className={styles.srOnly} aria-live="polite">
            {copied ? "Link copied to clipboard" : ""}
          </span>
      </div>
    </aside>
  );
}
