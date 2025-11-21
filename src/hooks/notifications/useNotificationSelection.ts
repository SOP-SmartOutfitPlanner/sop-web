import { useState, useCallback, useEffect, useMemo } from "react";
import type { NotificationItem } from "@/components/notifications/types";

export function useNotificationSelection(
  notifications: NotificationItem[],
  filteredNotifications: NotificationItem[]
) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Clean up selected IDs when notifications change
  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => notifications.some((n) => n.id === id))
    );
  }, [notifications]);

  const selectedNotifications = useMemo(
    () => notifications.filter((n) => selectedIds.includes(n.id)),
    [notifications, selectedIds]
  );

  const selectedCount = selectedIds.length;

  const handleSelectChange = useCallback((id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (selected) {
        set.add(id);
      } else {
        set.delete(id);
      }
      return Array.from(set);
    });
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedIds([]);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(filteredNotifications.map((n) => n.id));
  }, [filteredNotifications]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    isSelectionMode,
    selectedIds,
    selectedNotifications,
    selectedCount,
    setIsSelectionMode,
    setSelectedIds,
    handleSelectChange,
    toggleSelectionMode,
    handleSelectAll,
    handleClearSelection,
  };
}

