"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService, UsersPaginationResponse, UserStatistics } from "@/services/user.service";
import { toast } from "sonner";

// Query key factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; search?: string }) => [...userKeys.lists(), filters] as const,
  statistics: () => [...userKeys.all, "statistics"] as const,
};

export interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useUsers = ({ page = 1, limit = 10, search }: UseUsersParams = {}) => {
  return useQuery({
    queryKey: userKeys.list({ page, limit, search }),
    queryFn: () => UserService.getAllUsers(page, limit, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: () => UserService.getUserStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(message);
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => UserService.updateUserStatus(userId, isActive),
    onSuccess: () => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update user status";
      toast.error(message);
    },
  });
};

export const useToggleShowOnMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, showOnMap }: { userId: string; showOnMap: boolean }) => UserService.toggleShowOnMap(userId, showOnMap),
    onSuccess: () => {
      toast.success("User map visibility updated successfully");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update user map visibility";
      toast.error(message);
    },
  });
};
