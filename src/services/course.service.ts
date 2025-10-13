import axiosInstance from "@/lib/axios";

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  content: string;
  duration: number;
  tags: string[];
  thumbnailImage?: string;
  videoUrl?: string;
  videoFile?: string;
  price: number;
  currency: string;
  isFreeCourse: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "UNDER_REVIEW";
  isActive: boolean;
  maxEnrollments?: number;
  metaTitle?: string;
  metaDescription?: string;
  enrollmentCount: number;
  viewCount: number;
  rating?: number;
  reviewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  content: string;
  tags: string[];
  thumbnailImage?: string;
  videoUrl?: string;
  videoFile?: string;
  price: number;
  currency: string;
  isFreeCourse: boolean;
  maxEnrollments?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalViews: number;
  totalEnrollments: number;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

export class AdminCourseService {
  // Get all courses (admin view)
  static async getAllCourses(query?: CourseQuery) {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.status) params.append("status", query.status);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await axiosInstance.get(`/courses/admin?${params.toString()}`);
    return response.data;
  } // Create course
  static async createCourse(
    data: CreateCourseData,
    files?: {
      thumbnailImage?: File;
      videoFile?: File;
    }
  ) {
    const formData = new FormData();

    // Append text data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append files if provided
    if (files?.thumbnailImage) {
      formData.append("thumbnailImage", files.thumbnailImage);
    }
    if (files?.videoFile) {
      formData.append("videoFile", files.videoFile);
    }

    try {
      const response = await axiosInstance.post("/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 5 * 60 * 1000, // 5 minutes for file uploads
      });
      return response.data;
    } catch (error: any) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Course creation timed out. Please try again with smaller files.");
      }
      throw error;
    }
  }

  // Get course by ID
  static async getCourseById(id: string) {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  }
  // Update course
  static async updateCourse(
    id: string,
    data: Partial<CreateCourseData>,
    files?: {
      thumbnailImage?: File;
      videoFile?: File;
    }
  ) {
    const formData = new FormData();

    // Append text data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append files if provided
    if (files?.thumbnailImage) {
      formData.append("thumbnailImage", files.thumbnailImage);
    }
    if (files?.videoFile) {
      formData.append("videoFile", files.videoFile);
    }

    const response = await axiosInstance.put(`/courses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Delete course
  static async deleteCourse(id: string) {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  }

  // Publish course
  static async publishCourse(id: string, publishedAt?: string) {
    const response = await axiosInstance.patch(`/courses/${id}/publish`, {
      publishedAt,
    });
    return response.data;
  }

  // Unpublish course
  static async unpublishCourse(id: string) {
    const response = await axiosInstance.patch(`/courses/${id}/unpublish`);
    return response.data;
  }

  // Get course statistics
  static async getCourseStatistics(): Promise<{ data: CourseStats }> {
    const response = await axiosInstance.get("/courses/admin/statistics");
    return response.data;
  }

  // Get course categories
  static async getCourseCategories() {
    const response = await axiosInstance.get("/courses/categories");
    return response.data;
  }

  // Get course enrollments
  static async getCourseEnrollments(courseId: string, query?: any) {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.status) params.append("status", query.status);

    const response = await axiosInstance.get(`/courses/${courseId}/enrollments?${params.toString()}`);
    return response.data;
  }

  // Search courses
  static async searchCourses(query: string, filters?: Partial<CourseQuery>) {
    const params = new URLSearchParams();
    params.append("q", query);
    if (filters?.status) params.append("status", filters.status);

    const response = await axiosInstance.get(`/courses/search?${params.toString()}`);
    return response.data;
  }
}
