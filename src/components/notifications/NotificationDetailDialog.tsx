"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";
import { notificationAPI } from "@/lib/api";
import {
  getNotificationIcon,
  getTypeColor,
  getTypeIconColor,
  formatDate,
} from "./utils";

interface NotificationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationId: number | null;
  onMarkAsRead?: (id: number) => void;
}

export function NotificationDetailDialog({
  open,
  onOpenChange,
  notificationId,
  onMarkAsRead,
}: NotificationDetailDialogProps) {
  const queryClient = useQueryClient();
  const hasMarkedAsReadRef = useRef<Set<number>>(new Set());
  
  // Lock scroll when dialog is open
  useScrollLock(open);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notification-detail", notificationId],
    queryFn: async () => {
      if (!notificationId) return null;
      const response = await notificationAPI.getNotificationDetail(
        notificationId
      );
      return response.data;
    },
    enabled: open && !!notificationId,
  });

  const notification = data;

  // Auto mark as read when dialog opens and notification is unread
  useEffect(() => {
    if (open && notification && !notification.isRead && onMarkAsRead) {
      // Only mark as read once per notification
      if (!hasMarkedAsReadRef.current.has(notification.id)) {
        onMarkAsRead(notification.id);
        hasMarkedAsReadRef.current.add(notification.id);

        // Invalidate query to refresh notification detail
        queryClient.invalidateQueries({
          queryKey: ["notification-detail", notificationId],
        });
      }
    }
  }, [open, notification, onMarkAsRead, notificationId, queryClient]);

  // Clean up marked as read ref when dialog closes
  useEffect(() => {
    if (!open && notificationId) {
      hasMarkedAsReadRef.current.delete(notificationId);
    }
  }, [open, notificationId]);

  const handleOpenLink = () => {
    if (notification?.href && notification.href !== "string") {
      window.open(notification.href, "_blank");
    }
  };

  if (!notification && !isLoading) {
    return null;
  }

  const Icon = notification ? getNotificationIcon(notification.type) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 font-poppins">
              Failed to load notification details
            </p>
          </div>
        ) : notification ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4 mb-4">
                {Icon && (
                  <div
                    className={`w-16 h-16 rounded-xl bg-linear-to-br ${getTypeColor(
                      notification.type.toLowerCase()
                    )} border shrink-0 shadow-lg flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-8 h-8 ${getTypeIconColor(
                        notification.type.toLowerCase()
                      )}`}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bricolage text-white mb-2">
                    {notification.title}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 font-poppins">
                    {formatDate(notification.createdAt)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Message Content */}
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
                <p className="text-slate-200 font-poppins text-base leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>

              {/* Actions */}
              {notification.href && notification.href !== "string" && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/30">
                  <GlassButton
                    variant="ghost"
                    size="md"
                    onClick={handleOpenLink}
                    className="bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </GlassButton>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
