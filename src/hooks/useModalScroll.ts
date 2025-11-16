import { useEffect, useRef } from "react";

/**
 * Custom hook to enable mouse wheel scrolling in modal content areas
 * This ensures scroll works properly even when body scroll is locked
 * 
 * @param isOpen - Boolean indicating whether the modal is open
 * @param options - Optional configuration
 * @returns Ref to attach to the scrollable container
 */
export function useModalScroll(
  isOpen: boolean,
  options?: {
    /**
     * Whether to enable smooth scrolling
     * @default false (for better performance)
     */
    smooth?: boolean;
    /**
     * Scroll sensitivity multiplier
     * @default 10 (10x faster than default)
     */
    sensitivity?: number;
  }
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { smooth = false, sensitivity = 1000 } = options || {};

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if the event target is within our scroll container
      const target = e.target as Node;
      if (!container.contains(target) && target !== container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop >= maxScroll - 1;
      
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // If we can scroll in the requested direction, manually scroll
      if (scrollingDown && !isAtBottom) {
        e.preventDefault();
        e.stopPropagation();
        
        const scrollAmount = e.deltaY * sensitivity;
        const newScrollTop = Math.min(scrollTop + scrollAmount, maxScroll);
        
        // Use requestAnimationFrame for better performance
        if (smooth) {
          requestAnimationFrame(() => {
            container.scrollTo({
              top: newScrollTop,
              behavior: 'smooth'
            });
          });
        } else {
          // Direct scroll for instant response
          container.scrollTop = newScrollTop;
        }
        return;
      }

      if (scrollingUp && !isAtTop) {
        e.preventDefault();
        e.stopPropagation();
        
        const scrollAmount = e.deltaY * sensitivity;
        const newScrollTop = Math.max(scrollTop + scrollAmount, 0);
        
        // Use requestAnimationFrame for better performance
        if (smooth) {
          requestAnimationFrame(() => {
            container.scrollTo({
              top: newScrollTop,
              behavior: 'smooth'
            });
          });
        } else {
          // Direct scroll for instant response
          container.scrollTop = newScrollTop;
        }
        return;
      }

      // If at boundary, prevent scroll chaining to body
      if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add event listener to the container itself
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, smooth, sensitivity]);

  return scrollContainerRef;
}

