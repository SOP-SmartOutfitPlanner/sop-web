import { useEffect } from "react";

// Type declaration for Lenis instance on window
declare global {
  interface Window {
    lenis?: {
      stop: () => void;
      start: () => void;
    };
  }
}

/**
 * Custom hook to lock/unlock scroll when modals or dialogs are open
 * Also handles Lenis smooth scrolling if present
 *
 * @param isLocked - Boolean indicating whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    const html = document.documentElement;

    if (isLocked) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Stop Lenis smooth scrolling if available
      html.classList.add("lenis-stopped");
      html.style.overflow = "hidden";

      // Try to stop Lenis instance if it exists
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.stop();
      }

      // Prevent body scroll - multiple approaches for reliability
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";

      // Prevent scroll on wheel and touchmove, but allow scrolling inside modals/dialogs
      const preventScroll = (e: Event) => {
        // Allow scrolling inside modal/dialog containers
        const target = e.target as HTMLElement;
        if (target) {
          // Check if the event is inside a modal/dialog or scrollable container
          const scrollableContainer = target.closest('[role="dialog"], [data-radix-dialog-content], .overflow-y-auto, .overflow-auto');
          if (scrollableContainer) {
            return; // Allow scroll inside modal
          }
        }
        e.preventDefault();
        e.stopPropagation();
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });

      // Cleanup function when unlocking or unmounting
      return () => {
        // Remove event listeners first
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('scroll', preventScroll);

        // Re-enable Lenis smooth scrolling
        html.classList.remove("lenis-stopped");
        html.style.overflow = "";

        // Restart Lenis instance if it exists
        if (typeof window !== 'undefined' && window.lenis) {
          window.lenis.start();
        }

        // Restore body scroll and scroll position
        const savedScrollY = document.body.style.top;
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";

        if (savedScrollY) {
          window.scrollTo(0, parseInt(savedScrollY || "0") * -1);
        }
      };
    }
  }, [isLocked]);
}
