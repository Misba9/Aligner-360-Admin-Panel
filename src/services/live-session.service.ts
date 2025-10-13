import axiosInstance from "@/lib/axios";

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  slug: string;
  topic: string;
  tags: string[];
  scheduledAt: string;
  duration: number; // in minutes
  timezone: string;
  meetLink: string;
  meetId?: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "POSTPONED";
  isActive: boolean;
  maxParticipants?: number;
  isRecorded: boolean;
  recordingUrl?: string;
  isFree: boolean;
  price?: number;
  currency?: string;
  thumbnailImage?: string;
  materials?: string[];
  metaTitle?: string;
  metaDescription?: string;
  registrationCount: number;
  attendanceCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface CreateLiveSessionDto {
  title: string;
  description: string;
  slug?: string;
  topic: string;
  tags?: string[];
  scheduledAt: string;
  duration: number;
  timezone?: string;
  meetLink: string;
  meetId?: string;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "POSTPONED";
  isActive?: boolean;
  maxParticipants?: number;
  isRecorded?: boolean;
  recordingUrl?: string;
  isFree?: boolean;
  price?: number;
  currency?: string;
  thumbnailImage?: string;
  materials?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateLiveSessionDto {
  title?: string;
  description?: string;
  slug?: string;
  topic?: string;
  tags?: string[];
  scheduledAt?: string;
  duration?: number;
  timezone?: string;
  meetLink?: string;
  meetId?: string;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED" | "POSTPONED";
  isActive?: boolean;
  maxParticipants?: number;
  isRecorded?: boolean;
  recordingUrl?: string;
  isFree?: boolean;
  price?: number;
  currency?: string;
  thumbnailImage?: string;
  materials?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface LiveSessionQuery {
  search?: string;
  status?: string;
  createdById?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LiveSessionResponse {
  success: boolean;
  message: string;
  data: LiveSession[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class LiveSessionService {
  // Get all live sessions (admin)
  static async getAllLiveSessions(query?: LiveSessionQuery): Promise<LiveSessionResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await axiosInstance.get(`/live-sessions/admin?${params.toString()}`);
    return response.data;
  }

  // Create live session (admin)
  static async createLiveSession(data: CreateLiveSessionDto): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.post("/live-sessions", data);
    return response.data;
  }

  // Get live session by ID
  static async getLiveSessionById(id: string): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.get(`/live-sessions/${id}`);
    return response.data;
  }

  // Update live session (admin)
  static async updateLiveSession(id: string, data: UpdateLiveSessionDto): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.put(`/live-sessions/${id}`, data);
    return response.data;
  }

  // Delete live session (admin)
  static async deleteLiveSession(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/live-sessions/${id}`);
    return response.data;
  }

  // Start live session (admin)
  static async startLiveSession(id: string): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.patch(`/live-sessions/${id}/start`);
    return response.data;
  }

  // End live session (admin)
  static async endLiveSession(id: string): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.patch(`/live-sessions/${id}/end`);
    return response.data;
  }

  // Cancel live session (admin)
  static async cancelLiveSession(id: string): Promise<{ success: boolean; message: string; data: LiveSession }> {
    const response = await axiosInstance.patch(`/live-sessions/${id}/cancel`);
    return response.data;
  }

  // Get live session statistics (admin)
  static async getLiveSessionStatistics(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await axiosInstance.get("/live-sessions/admin/statistics");
    return response.data;
  }
}
