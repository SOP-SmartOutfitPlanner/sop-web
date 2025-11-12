import { useEffect } from "react";

/**
 * Custom hook to lock/unlock scroll when modals or dialogs are open
 * Also handles Lenis smooth scrolling if present
 *
 * @param isLocked - Boolean indicating whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isLocked) {
      const scrollY = window.scrollY;

      // Persist scroll position so we can restore it later
      body.dataset.scrollLockSavedPosition = scrollY.toString();

      html.classList.add("lenis-stopped");
      html.style.overflow = "hidden";

      // Prevent body scroll with !important level specificity
      body.style.setProperty("overflow", "hidden", "important");
      body.style.setProperty("position", "fixed", "important");
      body.style.setProperty("width", "100%", "important");
      body.style.setProperty("top", `-${scrollY}px`, "important");
      body.style.setProperty("left", "0", "important");
      body.style.setProperty("right", "0", "important");
    } else {
      const savedScrollPosition = body.dataset.scrollLockSavedPosition;

      html.classList.remove("lenis-stopped");
      html.style.overflow = "";

      body.style.removeProperty("overflow");
      body.style.removeProperty("position");
      body.style.removeProperty("width");
      body.style.removeProperty("top");
      body.style.removeProperty("left");
      body.style.removeProperty("right");

      if (savedScrollPosition) {
        const top = parseInt(savedScrollPosition, 10);
        body.removeAttribute("data-scroll-lock-saved-position");
        window.scrollTo({ top });
      }
    }

    // Cleanup on unmount
    return () => {
      html.classList.remove("lenis-stopped");
      html.style.overflow = "";

      body.style.removeProperty("overflow");
      body.style.removeProperty("position");
      body.style.removeProperty("width");
      body.style.removeProperty("top");
      body.style.removeProperty("left");
      body.style.removeProperty("right");

      if (body.dataset.scrollLockSavedPosition) {
        const top = parseInt(body.dataset.scrollLockSavedPosition, 10);
        body.removeAttribute("data-scroll-lock-saved-position");
        window.scrollTo({ top });
      }
    };
  }, [isLocked]);
}
