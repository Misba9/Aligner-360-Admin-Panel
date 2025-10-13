"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminMapUserService, MapUser, MapUserQuery, MapUserStats, CreateMapUserData, UpdateMapUserData } from "@/services/mapuser.service";
import { toast } from "sonner";

// Query key factory
export const mapUserKeys = {
  all: ["mapUsers"] as const,
  lists: () => [...mapUserKeys.all, "list"] as const,
  list: (filters: MapUserQuery) => [...mapUserKeys.lists(), filters] as const,
  statistics: () => [...mapUserKeys.all, "statistics"] as const,
  detail: (id: string) => [...mapUserKeys.all, "detail", id] as const,
};

export interface UseMapUsersParams extends MapUserQuery {}

export const useMapUsers = (params: UseMapUsersParams = {}) => {
  return useQuery({
    queryKey: mapUserKeys.list(params),
    queryFn: () => AdminMapUserService.getAllMapUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMapUserStatistics = () => {
  return useQuery({
    queryKey: mapUserKeys.statistics(),
    queryFn: AdminMapUserService.getMapUserStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMapUser = (id: string) => {
  return useQuery({
    queryKey: mapUserKeys.detail(id),
    queryFn: () => AdminMapUserService.getMapUserById(id),
    enabled: !!id,
  });
};

export const useCreateMapUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMapUserData) => AdminMapUserService.createMapUser(data),
    onSuccess: () => {
      toast.success("Map user created successfully");
      queryClient.invalidateQueries({ queryKey: mapUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mapUserKeys.statistics() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create map user";
      toast.error(message);
    },
  });
};

export const useUpdateMapUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMapUserData }) => 
      AdminMapUserService.updateMapUser(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Map user updated successfully");
      queryClient.invalidateQueries({ queryKey: mapUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mapUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mapUserKeys.statistics() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update map user";
      toast.error(message);
    },
  });
};

export const useDeleteMapUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdminMapUserService.deleteMapUser(id),
    onSuccess: () => {
      toast.success("Map user deleted successfully");
      queryClient.invalidateQueries({ queryKey: mapUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mapUserKeys.statistics() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete map user";
      toast.error(message);
    },
  });
};

export const useToggleMapUserVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, showOnMap }: { id: string; showOnMap: boolean }) => 
      AdminMapUserService.toggleMapUserVisibility(id, showOnMap),
    onSuccess: () => {
      toast.success("Map user visibility updated successfully");
      queryClient.invalidateQueries({ queryKey: mapUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mapUserKeys.statistics() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update map user visibility";
      toast.error(message);
    },
  });
};
