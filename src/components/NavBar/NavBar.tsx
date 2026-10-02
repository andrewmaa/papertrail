import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import MenuToggle from "../MenuToggle/MenuToggle";
import styles from "./NavBar.module.css";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
  { label: "Enterprise", href: "#enterprise" },
];

const MENU_ID = "primary-menu";
const DESKTOP_QUERY = "(min-width: 1101px)";

type NavSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type NavBarProps = {
  search?: NavSearch;
};

export default function NavBar({ search }: NavBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const close = () => setOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const close = () => setOpen(false);

  if (search) {
    return (
      <header className={styles.bar}>
        <nav className={styles.inner} aria-label="Primary">
          <Logo />
          <div className={styles.searchGroup}>
          <form role="search" className={styles.searchForm} onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="nav-search" className={styles.visuallyHidden}>
              Search records
            </label>
            <svg
              className={styles.searchIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="nav-search"
              type="search"
              className={styles.searchInput}
              placeholder={search.placeholder ?? "Search by title or record ID"}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
            />
          </form>
          <Button
            variant="outline"
            href="mailto:support@papertrail.com?subject=Papertrail%20support"
            className={styles.supportButton}
          >
            Contact support
          </Button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.bar}>
      <nav className={styles.inner} aria-label="Primary" data-open={open || undefined}>
        <Logo />
        <MenuToggle
          open={open}
          controls={MENU_ID}
          onToggle={() => setOpen((value) => !value)}
          className={styles.toggle}
        />
        <div id={MENU_ID} className={styles.menu}>
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            {/* <Button variant="outline" href="/dashboard" className={styles.action}>
              Login
            </Button>
            <Button variant="primary" href="#demo" className={`${styles.action} ${styles.demo}`}>
              Request a Demo
            </Button> */}
            <Button variant="primary" href="/dashboard" className={`${styles.action} ${styles.demo}`}>
              Try it out
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
