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

export default function NavBar() {
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
            <Button variant="outline" href="/dashboard" className={styles.action}>
              Login
            </Button>
            <Button variant="primary" href="#demo" className={`${styles.action} ${styles.demo}`}>
              Request a Demo
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
