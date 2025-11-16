import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalenderAPI } from "@/lib/api/calender-api";
import {
  GetUserOccasionRequest,
  CreateUserOccasionRequest,
  EditUserOccasionRequest,
} from "@/types/userOccasion";
import {
  GetCalenderRequest,
  CreateCalenderRequest,
  EditCalenderRequest,
} from "@/types/calender";
import { OccasionsListRequest } from "@/types/occasion";

/**
 * Hook to fetch user occasions with filters
 */
export function useUserOccasions(params: GetUserOccasionRequest) {
  return useQuery({
    queryKey: ["user-occasions", params],
    queryFn: () => CalenderAPI.getUserOccasions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch calendar entries (outfit-occasion links)
 */
export function useCalendarEntries(params: GetCalenderRequest) {
  return useQuery({
    queryKey: ["calendar-entries", params],
    queryFn: () => CalenderAPI.getCalendarEntries(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch occasion types (master data)
 */
export function useOccasions(params: OccasionsListRequest) {
  return useQuery({
    queryKey: ["occasions", params],
    queryFn: () => CalenderAPI.getOccasions(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - rarely changes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new user occasion
 */
export function useCreateUserOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserOccasionRequest) =>
      CalenderAPI.createUserOccasion(data),
    onSuccess: (response) => {
      toast.success(response.message || "Occasion created successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create occasion:", error);
      toast.error(error.message || "Failed to create occasion");
    },
  });
}

/**
 * Hook to update an existing user occasion
 */
export function useUpdateUserOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EditUserOccasionRequest> }) =>
      CalenderAPI.updateUserOccasion(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Occasion updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update occasion:", error);
      toast.error(error.message || "Failed to update occasion");
    },
  });
}

/**
 * Hook to delete a user occasion
 */
export function useDeleteUserOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CalenderAPI.deleteUserOccasion(id),
    onSuccess: () => {
      toast.success("Occasion deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete occasion:", error);
      toast.error(error.message || "Failed to delete occasion");
    },
  });
}

/**
 * Hook to create a calendar entry (link outfit to occasion)
 */
export function useCreateCalendarEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalenderRequest) =>
      CalenderAPI.createCalendarEntry(data),
    onSuccess: (response) => {
      toast.success(response.message || "Added to calendar successfully!");
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
    },
    onError: (error: Error) => {
      console.error("Failed to add to calendar:", error);
      toast.error(error.message || "Failed to add to calendar");
    },
  });
}

/**
 * Hook to update a calendar entry
 */
export function useUpdateCalendarEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditCalenderRequest }) =>
      CalenderAPI.updateCalendarEntry(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Calendar entry updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update calendar entry:", error);
      toast.error(error.message || "Failed to update calendar entry");
    },
  });
}

/**
 * Hook to delete a calendar entry
 */
export function useDeleteCalendarEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CalenderAPI.deleteCalendarEntry(id),
    onSuccess: () => {
      toast.success("Outfit calendar entry deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["calendar-entries"] });
      queryClient.invalidateQueries({ queryKey: ["user-occasions"] });
    },
    onError: (error: Error) => {
      console.error("Failed to remove from calendar:", error);
      toast.error(error.message || "Failed to remove from calendar");
    },
  });
}
