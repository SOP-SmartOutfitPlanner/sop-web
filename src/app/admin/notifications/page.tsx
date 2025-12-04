 "use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Search, Loader2, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { notificationAPI, type Notification } from "@/lib/api/notification-api";
import { usePushNotification } from "@/hooks/admin/usePushNotification";

export default function AdminNotificationPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<"all" | "user">("all");
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formUserId, setFormUserId] = useState("");

  const pushNotificationMutation = usePushNotification();

  const handlePushNotification = async () => {
    if (!formTitle.trim()) return;
    if (!formMessage.trim()) return;

    const actorUserId = notificationType === "all" ? 1 : parseInt(formUserId);
    if (notificationType === "user" && (!formUserId || isNaN(actorUserId))) {
      return;
    }

    try {
      await pushNotificationMutation.mutateAsync({
        title: formTitle,
        message: formMessage,
        href: formHref.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        actorUserId,
      });
      setIsPushDialogOpen(false);
      setFormTitle("");
      setFormMessage("");
      setFormHref("");
      setFormImageUrl("");
      setFormUserId("");
      setNotificationType("all");
    } catch {
      // Error handled by mutation
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin-notifications", currentPage, pageSize, debouncedSearch],
    queryFn: () =>
      notificationAPI.getNotificationAdmin({
        pageIndex: currentPage,
        pageSize,
        newestFirst: true,
        searchTerm: debouncedSearch || undefined,
      }),
    staleTime: 0,
  });

  const notifications: Notification[] = data?.data.data ?? [];
  const metaData = data?.data.metaData;

  // Auto-reset page if current page is empty and not first page
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      notifications.length === 0 &&
      currentPage > 1 &&
      metaData
    ) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, notifications.length, currentPage, metaData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            System Notifications
          </h1>
          <p className="text-white/70 mt-2">
            View and send system notifications to users
          </p>
        </div>
        <Button
          onClick={() => setIsPushDialogOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40 transition-all duration-200"
        >
          <Bell className="w-4 h-4 mr-2" />
          Push Notification
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-cyan-400/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-3 text-white/70">Loading notifications...</span>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="text-center py-12 text-red-400">
          Failed to load notifications. Please try again.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && notifications.length === 0 && (
        <div className="text-center py-12 text-white/70">
          No notifications found.
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {n.title}
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px]">
                        ID #{n.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70">{n.message}</p>
                    <p className="text-xs text-white/40">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {n.href && (
                    <div className="text-xs text-cyan-300 break-all">
                      Link: {n.href}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {metaData && metaData.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/70">
          <div>
            Page{" "}
            <span className="font-semibold text-cyan-300">
              {metaData.currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-cyan-300">
              {metaData.totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!metaData.hasPrevious || isFetching}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!metaData.hasNext || isFetching}
              onClick={() =>
                setCurrentPage((p) =>
                  metaData.hasNext ? p + 1 : metaData.currentPage
                )
              }
              className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Push Notification Dialog */}
      <Dialog open={isPushDialogOpen} onOpenChange={setIsPushDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Push Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to users. Use actorUserId = 1 to send to all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Recipient</Label>
              <RadioGroup
                value={notificationType}
                onValueChange={(value) => setNotificationType(value as "all" | "user")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Users (Broadcast)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="font-normal cursor-pointer">
                    Specific User
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {notificationType === "user" && (
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  type="number"
                  placeholder="Enter user ID..."
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notification title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter notification message..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="href">Link (Optional)</Label>
              <Input
                id="href"
                placeholder="e.g., /wardrobe, /profile/123"
                value={formHref}
                onChange={(e) => setFormHref(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL (Optional)</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPushDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePushNotification}
              disabled={pushNotificationMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {pushNotificationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

