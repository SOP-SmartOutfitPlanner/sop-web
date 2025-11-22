import { useMutation } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import { toast } from "sonner";

/**
 * Hook for pushing notifications
 */
export function usePushNotification() {
  return useMutation({
    mutationFn: (data: {
      title: string;
      message: string;
      href?: string;
      imageUrl?: string;
      actorUserId: number;
    }) => {
      const isBroadcast = data.actorUserId === 1;
      return adminAPI.pushNotification(data).then((response) => ({
        ...response,
        isBroadcast,
      }));
    },
    onSuccess: (response, variables) => {
      toast.success(
        variables.actorUserId === 1
          ? "Notification sent to all users successfully!"
          : "Notification sent successfully!",
        {
          description: response.data.message,
        }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send notification");
    },
  });
}

