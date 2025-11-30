import { useEffect, useRef, useCallback } from "react";

// Type declaration for Lenis instance on window
declare global {
  interface Window {
    lenis?: {
      stop: () => void;
      start: () => void;
    };
  }
}

// Track the number of active scroll locks to handle nested modals
let scrollLockCount = 0;
let savedScrollY = 0;

/**
 * Custom hook to lock/unlock scroll when modals or dialogs are open
 * Also handles Lenis smooth scrolling if present
 * Supports nested modals by tracking lock count
 *
 * @param isLocked - Boolean indicating whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  const wasLockedRef = useRef(false);

  const lock = useCallback(() => {
    if (scrollLockCount === 0) {
      // Save scroll position only on first lock
      savedScrollY = window.scrollY;
      
      const html = document.documentElement;
      
      // Stop Lenis smooth scrolling if available
      html.classList.add("lenis-stopped");
      
      // Try to stop Lenis instance if it exists
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.stop();
      }

      // Use overflow hidden approach with scroll position compensation
      // This prevents the page jump by keeping the visual position
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      
      // For Lenis/smooth scroll pages, we need position fixed
      if (window.lenis) {
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
      }
    }
    scrollLockCount++;
  }, []);

  const unlock = useCallback(() => {
    scrollLockCount--;
    
    if (scrollLockCount <= 0) {
      scrollLockCount = 0; // Prevent negative
      
      const html = document.documentElement;
      
      // Re-enable Lenis smooth scrolling
      html.classList.remove("lenis-stopped");
      
      // Restart Lenis instance if it exists
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }

      // Restore body styles
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";

      // Restore scroll position only if we used position fixed
      if (window.lenis) {
        window.scrollTo(0, savedScrollY);
      }
    }
  }, []);

  useEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      lock();
      wasLockedRef.current = true;
    } else if (!isLocked && wasLockedRef.current) {
      unlock();
      wasLockedRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (wasLockedRef.current) {
        unlock();
        wasLockedRef.current = false;
      }
    };
  }, [isLocked, lock, unlock]);
}
