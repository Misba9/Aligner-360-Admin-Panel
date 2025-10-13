import axiosInstance from "@/lib/axios";
import { User } from "@/types/auth";

// Extended user interface for admin operations
export interface AdminUser extends User {
  address?: string;
}

export interface UsersPaginationResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStatistics {
  totalUsers: number;
  totalVerifiedUsers: number;
  totalUnverifiedUsers: number;
  totalDentists: number;
  totalOrthodontists: number;
}

export class UserService {
  static async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersPaginationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await axiosInstance.get(`/users?${params.toString()}`);
    return response.data;
  }

  static async deleteUser(id: string) {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  }
  static async updateUserStatus(id: string, isActive: boolean) {
    const response = await axiosInstance.patch(`/users/${id}/status`, { isActive });
    return response.data;
  }

  static async toggleShowOnMap(id: string, showOnMap: boolean) {
    const response = await axiosInstance.patch(`/users/${id}/show-on-map`, { showOnMap });
    return response.data;
  }

  static async getUserStatistics(): Promise<{ success: boolean; data: UserStatistics; message: string }> {
    const response = await axiosInstance.get("/users/statistics");
    return response.data;
  }
}
