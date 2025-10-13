import axiosInstance from "@/lib/axios";

export interface MapUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  clinicName: string;
  zipCode: string;
  showOnMap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMapUserData {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  clinicName: string;
  zipCode: string;
  showOnMap?: boolean;
}

export interface UpdateMapUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  clinicName?: string;
  zipCode?: string;
  showOnMap?: boolean;
}

export interface MapUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  showOnMap?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MapUserStats {
  totalMapUsers: number;
  visibleMapUsers: number;
  hiddenMapUsers: number;
  popularLocations: Array<{
    location: string;
    count: number;
  }>;
}

export class AdminMapUserService {
  // Get all map users (admin view)
  static async getAllMapUsers(query?: MapUserQuery) {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.showOnMap !== undefined) params.append("showOnMap", query.showOnMap.toString());
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await axiosInstance.get(`/map-users/admin?${params.toString()}`);
    return response.data;
  }

  // Create map user
  static async createMapUser(data: CreateMapUserData) {
    const response = await axiosInstance.post("/map-users", data);
    return response.data;
  }

  // Get map user by ID
  static async getMapUserById(id: string) {
    const response = await axiosInstance.get(`/map-users/${id}/admin`);
    return response.data;
  }

  // Update map user
  static async updateMapUser(id: string, data: UpdateMapUserData) {
    const response = await axiosInstance.put(`/map-users/${id}`, data);
    return response.data;
  }

  // Delete map user
  static async deleteMapUser(id: string) {
    const response = await axiosInstance.delete(`/map-users/${id}`);
    return response.data;
  }

  // Toggle map user visibility
  static async toggleMapUserVisibility(id: string, showOnMap: boolean) {
    const response = await axiosInstance.patch(`/map-users/${id}/toggle-visibility`, {
      showOnMap,
    });
    return response.data;
  }

  // Get map user statistics
  static async getMapUserStatistics(): Promise<{ data: MapUserStats }> {
    const response = await axiosInstance.get("/map-users/admin/statistics");
    return response.data;
  }
}
