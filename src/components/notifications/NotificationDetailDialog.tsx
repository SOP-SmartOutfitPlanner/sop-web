"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";
import { notificationAPI } from "@/lib/api";
import {
  getNotificationIconFromHref,
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
  const router = useRouter();
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

  // Get the appropriate icon based on notification context
  const Icon = useMemo(() => {
    if (!notification) return null;
    return getNotificationIconFromHref(
      notification.href,
      notification.type,
      notification.title
    );
  }, [notification]);

  // Determine avatar URL (actor avatar or imageUrl)
  const avatarUrl = notification?.actorAvatarUrl || notification?.imageUrl;

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

  const handleViewDetails = () => {
    if (notification?.href && notification.href !== "string") {
      // Close the dialog first
      onOpenChange(false);

      // Transform href to open modal in community page
      // /posts/{postId} -> /community?postId={postId}
      // /collections/{collectionId} -> /collections?collectionId={collectionId}
      let targetUrl = notification.href;

      const postMatch = notification.href.match(/^\/posts\/(\d+)$/);
      if (postMatch) {
        targetUrl = `/community?postId=${postMatch[1]}`;
      }

      const collectionMatch = notification.href.match(/^\/collections\/(\d+)$/);
      if (collectionMatch) {
        targetUrl = `/collections?collectionId=${collectionMatch[1]}`;
      }

      router.push(targetUrl);
    }
  };

  const handleMarkAsRead = () => {
    if (notification && !notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  if (!notification && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl bg-slate-950/90 backdrop-blur-xl border-white/10 text-white"
        aria-labelledby="notification-dialog-title"
        aria-describedby="notification-dialog-description"
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
                {/* Avatar or Icon */}
                <div
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getTypeColor(
                    notification.type.toLowerCase()
                  )} border shrink-0 shadow-lg flex items-center justify-center overflow-hidden`}
                >
                  {avatarUrl ? (
                    <>
                      <Image
                        src={avatarUrl}
                        alt={notification.actorDisplayName || "Notification"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      {/* Icon badge */}
                      {Icon && (
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br ${getTypeColor(
                            notification.type.toLowerCase()
                          )} shadow-md`}
                        >
                          <Icon
                            className={`h-3 w-3 ${getTypeIconColor(
                              notification.type.toLowerCase()
                            )}`}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    Icon && (
                      <Icon
                        className={`w-8 h-8 ${getTypeIconColor(
                          notification.type.toLowerCase()
                        )}`}
                      />
                    )
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <DialogTitle
                    id="notification-dialog-title"
                    className="text-2xl font-bricolage text-white"
                  >
                    {notification.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    {notification.actorDisplayName && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-pink-200">
                        {notification.actorDisplayName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
                <DialogClose className="text-slate-400 hover:text-white">
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5">
                {/* Message with HTML support */}
                <p
                  id="notification-dialog-description"
                  className="text-slate-200 font-poppins text-base leading-relaxed whitespace-pre-wrap [&>b]:font-semibold [&>b]:text-white [&>strong]:font-semibold [&>strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: notification.message }}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <GlassButton
                variant="ghost"
                size="md"
                className="bg-white/10 text-white border border-white/20"
                onClick={() => onOpenChange(false)}
              >
                Dismiss
              </GlassButton>

              {notification.href && notification.href !== "string" && (
                <GlassButton
                  variant="ghost"
                  size="md"
                  onClick={handleViewDetails}
                  className="bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View details
                </GlassButton>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
