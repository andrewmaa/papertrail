export function initDotGridSpotlight() {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const root = document.documentElement;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;

  const apply = () => {
    frame = 0;
    root.style.setProperty("--spotlight-x", `${pointerX}px`);
    root.style.setProperty("--spotlight-y", `${pointerY}px`);
    root.style.setProperty("--spotlight-scroll-y", `${window.scrollY}px`);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(apply);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      root.dataset.spotlight = "on";
      schedule();
    },
    { passive: true },
  );

  window.addEventListener("scroll", schedule, { passive: true });

  document.addEventListener("pointerleave", () => {
    delete root.dataset.spotlight;
  });
  window.addEventListener("blur", () => {
    delete root.dataset.spotlight;
  });
}
