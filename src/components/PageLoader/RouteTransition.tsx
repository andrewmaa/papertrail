import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./PageLoader";

const VISIBLE_MS = 650;
const FADE_MS = 280;

type Phase = "idle" | "loading" | "leaving";

export default function RouteTransition() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.scrollTo(0, 0);
    setPhase("loading");
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), VISIBLE_MS);
    const doneTimer = window.setTimeout(() => setPhase("idle"), VISIBLE_MS + FADE_MS);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [pathname]);

  if (phase === "idle") return null;
  return <PageLoader leaving={phase === "leaving"} />;
}
