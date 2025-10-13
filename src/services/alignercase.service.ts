import axiosInstance from "@/lib/axios";

export interface AlignerCase {
  id: string;
  name: string;
  quantity: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlignerCaseDto {
  name: string;
  quantity: string;
  userId: string;
}

export interface UpdateAlignerCaseDto {
  name?: string;
  quantity?: string;
  userId?: string;
}

export interface AlignerCaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AlignerCaseResponse {
  success: boolean;
  message: string;
  data: AlignerCase[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AlignerCaseStatistics {
  totalCases: number;
  usersWithCases: number;
  averageCasesPerUser: number;
  recentCases: AlignerCase[];
  casesByUser: {
    userId: string;
    caseCount: number;
  }[];
}

export class AlignerCaseService {
  // Get all aligner cases (admin view)
  static async getAllAlignerCases(query?: AlignerCaseQuery): Promise<AlignerCaseResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.userId) params.append("userId", query.userId);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await axiosInstance.get(`/aligner-cases/admin?${params.toString()}`);
    return response.data;
  }

  // Create aligner case (admin)
  static async createAlignerCase(data: CreateAlignerCaseDto): Promise<{ success: boolean; message: string; data: AlignerCase }> {
    const response = await axiosInstance.post("/aligner-cases", data);
    return response.data;
  }

  // Get aligner case by ID
  static async getAlignerCaseById(id: string): Promise<{ success: boolean; message: string; data: AlignerCase }> {
    const response = await axiosInstance.get(`/aligner-cases/admin/${id}`);
    return response.data;
  }

  // Update aligner case (admin)
  static async updateAlignerCase(id: string, data: UpdateAlignerCaseDto): Promise<{ success: boolean; message: string; data: AlignerCase }> {
    const response = await axiosInstance.put(`/aligner-cases/${id}`, data);
    return response.data;
  }

  // Delete aligner case (admin)
  static async deleteAlignerCase(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/aligner-cases/${id}`);
    return response.data;
  }

  // Get aligner case statistics
  static async getAlignerCaseStatistics(): Promise<{ success: boolean; message: string; data: AlignerCaseStatistics }> {
    const response = await axiosInstance.get("/aligner-cases/admin/statistics");
    return response.data;
  }
}
