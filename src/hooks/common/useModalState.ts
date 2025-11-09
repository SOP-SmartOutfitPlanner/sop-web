import { useState, useCallback } from "react";

interface UseModalStateProps {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Custom hook for managing modal open/close state
 * Reusable across FollowersModal, PostModal, etc.
 */
export function useModalState({
  initialOpen = false,
  onOpen,
  onClose,
}: UseModalStateProps = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

