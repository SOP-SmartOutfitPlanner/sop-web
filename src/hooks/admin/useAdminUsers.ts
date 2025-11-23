import { useQuery } from "@tanstack/react-query";
import { adminAPI, type GetUsersParams } from "@/lib/api/admin-api";

/**
 * Hook to fetch admin users list
 */
export function useAdminUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await adminAPI.getUsers(params);
      return response.data;
    },
    staleTime: 30000,
  });
}

/**
 * Hook to fetch single user by ID
 */
export function useAdminUser(userId: number) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const response = await adminAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}

