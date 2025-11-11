import { useEffect } from "react";

/**
 * Custom hook to lock/unlock scroll when modals or dialogs are open
 * Also handles Lenis smooth scrolling if present
 *
 * @param isLocked - Boolean indicating whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Stop Lenis smooth scrolling
      const html = document.documentElement;
      html.classList.add("lenis-stopped");
      html.style.overflow = "hidden";

      // Prevent body scroll with !important level specificity
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important");
      document.body.style.setProperty("width", "100%", "important");
      document.body.style.setProperty("top", `-${scrollY}px`, "important");
      document.body.style.setProperty("left", "0", "important");
      document.body.style.setProperty("right", "0", "important");
    } else {
      // Re-enable Lenis smooth scrolling
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");
      html.style.overflow = "";

      // // Restore body scroll and scroll position
      // const scrollY = document.body.style.top;
      // document.body.style.removeProperty("overflow");
      // document.body.style.removeProperty("position");
      // document.body.style.removeProperty("width");
      // document.body.style.removeProperty("top");
      // document.body.style.removeProperty("left");
      // document.body.style.removeProperty("right");

      // if (scrollY) {
      //   window.scrollTo(0, parseInt(scrollY || "0") * -1);
      // }
    }

    // Cleanup on unmount
    return () => {
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isLocked]);
}
