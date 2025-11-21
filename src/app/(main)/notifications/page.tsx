"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import NotificationCard from "@/components/notifications/NotificationCard";
import FilterBar from "@/components/notifications/FilterBar";
import LoadingState from "@/components/notifications/LoadingState";
import ErrorState from "@/components/notifications/ErrorState";
import EmptyState from "@/components/notifications/EmptyState";
import { NotificationDetailDialog } from "@/components/notifications/NotificationDetailDialog";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { SelectionModeBar } from "@/components/notifications/SelectionModeBar";
import { BulkDeletePreview } from "@/components/notifications/BulkDeletePreview";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationItem, FilterType } from "@/components/notifications/types";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useNotificationActions } from "@/hooks/notifications/useNotificationActions";
import { useNotificationSelection } from "@/hooks/notifications/useNotificationSelection";

const FILTER_LABEL_MAP: Record<FilterType, string> = {
  all: "notifications",
  unread: "unread updates",
  system: "system updates",
  user: "user updates",
};

function NotificationQueryHandler({
  onNotificationId,
}: {
  onNotificationId: (id: number) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const notificationId = searchParams.get("id");
    if (notificationId) {
      const id = parseInt(notificationId, 10);
      if (!isNaN(id)) {
        onNotificationId(id);
        window.history.replaceState({}, "", "/notifications");
      }
    }
  }, [searchParams, onNotificationId]);

  return null;
}

function NotificationsPageContent({
  initialNotificationId,
}: {
  initialNotificationId: number | null;
}) {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Handle notification ID from query params
  useEffect(() => {
    if (initialNotificationId) {
      setSelectedNotificationId(initialNotificationId);
      setIsDetailDialogOpen(true);
    }
  }, [initialNotificationId]);

  // Custom hooks
  const {
    notifications,
    filteredNotifications,
    filterCounts,
    unreadCount,
    isLoading,
    error,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useNotifications(user?.id, filter);

  const { markAsRead, markAllAsRead, deleteNotification, deleteNotificationsBulk } =
    useNotificationActions(user?.id);

  const {
    isSelectionMode,
    selectedIds,
    selectedCount,
    setIsSelectionMode,
    setSelectedIds,
    handleSelectChange,
    toggleSelectionMode,
    handleSelectAll,
    handleClearSelection,
  } = useNotificationSelection(notifications, filteredNotifications);

  const filterDescription = FILTER_LABEL_MAP[filter] ?? "notifications";

  // Handlers
  const handleViewDetail = useCallback((id: number) => {
    setSelectedNotificationId(id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback(
    (id: number) => {
      const target = notifications.find((n) => n.id === id);
      if (!target) return;
      setDeleteTarget(target);
      setIsDeleteDialogOpen(true);
    },
    [notifications]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteNotification(deleteTarget.id);
    setIsDeleting(false);
    if (success) {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteNotification, deleteTarget]);

  const handleBulkDeleteRequest = useCallback(() => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleteDialogOpen(true);
  }, [selectedIds.length]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    const success = await deleteNotificationsBulk(selectedIds);
    setIsBulkDeleting(false);
    if (success) {
      setIsBulkDeleteDialogOpen(false);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  }, [deleteNotificationsBulk, selectedIds, setSelectedIds, setIsSelectionMode]);

  const handleDetailDialogClose = useCallback((open: boolean) => {
    setIsDetailDialogOpen(open);
    if (!open) {
      setSelectedNotificationId(null);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isSelectionMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedIds.length > 0) {
        e.preventDefault();
        handleBulkDeleteRequest();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsSelectionMode(false);
        setSelectedIds([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode, selectedIds.length, handleBulkDeleteRequest, handleSelectAll, setIsSelectionMode, setSelectedIds]);

  // Infinite scroll
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const element = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedFilteredNotifications = filteredNotifications.filter((n) =>
    selectedIds.includes(n.id)
  );

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-5xl mx-auto px-4 py-6 space-y-8">
        <NotificationsHeader
          unreadCount={unreadCount}
          filteredCount={filteredNotifications.length}
          filterDescription={filterDescription}
          onMarkAllAsRead={markAllAsRead}
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedCount}
          onBulkDelete={handleBulkDeleteRequest}
        />

        {isSelectionMode && (
          <SelectionModeBar
            selectedCount={selectedCount}
            totalCount={filteredNotifications.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            isAllSelected={selectedCount === filteredNotifications.length}
          />
        )}

        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          filterCounts={filterCounts}
          isLoading={isFetching}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={markAsRead}
                  onDeleteRequest={handleDeleteRequest}
                  onViewDetail={handleViewDetail}
                  selectable={isSelectionMode}
                  selected={selectedIds.includes(notification.id)}
                  onSelectChange={handleSelectChange}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {filteredNotifications.length > 0 && (
          <motion.div
            ref={loadMoreRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-8"
          >
            {hasNextPage ? (
              <GlassButton
                variant="ghost"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-w-[220px]"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating feed...
                  </span>
                ) : (
                  "Load More Notifications"
                )}
              </GlassButton>
            ) : (
              <p className="text-sm text-cyan-300/70">
                You&apos;re all caught up on {filterDescription}.
              </p>
            )}
          </motion.div>
        )}
      </div>

      <NotificationDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={handleDetailDialogClose}
        notificationId={selectedNotificationId}
        onMarkAsRead={markAsRead}
      />

      <ConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeleteTarget(null);
            setIsDeleting(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        loadingText="Deleting..."
        title="Remove notification?"
        subtitle={deleteTarget?.title}
        confirmButtonText="Delete"
        contentClassName="text-slate-200"
      >
        <p className="font-poppins text-sm text-slate-300">
          This notification will move to your archive. You can&apos;t undo this
          action.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={isBulkDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsBulkDeleteDialogOpen(open);
          if (!open) {
            setIsBulkDeleting(false);
          }
        }}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={isBulkDeleting}
        loadingText={`Deleting ${selectedCount} notification${
          selectedCount > 1 ? "s" : ""
        }...`}
        title="Delete selected notifications?"
        subtitle={
          selectedCount > 0
            ? `${selectedCount} notification${selectedCount > 1 ? "s" : ""} will be removed`
            : undefined
        }
        confirmButtonText={`Delete ${selectedCount}`}
        confirmButtonIcon={<Trash2 className="w-4 h-4" />}
        confirmButtonColor="rgba(239, 68, 68, 0.8)"
        confirmButtonBorderColor="rgba(239, 68, 68, 1)"
        contentClassName="text-slate-200 space-y-4"
        maxHeight="70vh"
      >
        <BulkDeletePreview
          notifications={selectedFilteredNotifications}
          selectedCount={selectedCount}
        />
      </ConfirmModal>
    </div>
  );
}

export default function NotificationsPage() {
  const [notificationIdFromQuery, setNotificationIdFromQuery] = useState<number | null>(null);

  return (
    <Suspense fallback={<div className="min-h-screen pt-32" />}>
      <NotificationQueryHandler onNotificationId={setNotificationIdFromQuery} />
      <NotificationsPageContent initialNotificationId={notificationIdFromQuery} />
    </Suspense>
  );
}
