import axiosInstance from "@/lib/axios";

export interface Ebook {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  category?: string;
  tags: string[];
  thumbnailImage?: string;
  pdf?: string;
  video?: string;
  price: number;
  currency?: string;
  isFreeEbook: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "UNDER_REVIEW";
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  downloadCount: number;
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

export interface CreateEbookData {
  title: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  thumbnailImage?: string;
  price: number;
  isFreeEbook: boolean;
  video?: string;
}

export interface EbookQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EbookStats {
  totalEbooks: number;
  publishedEbooks: number;
  draftEbooks: number;
  archivedEbooks: number;
  totalViews: number;
  totalDownloads: number;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

export class AdminEbookService {
  // Get all ebooks (admin view)
  static async getAllEbooks(query?: EbookQuery) {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.category) params.append("category", query.category);
    if (query?.status) params.append("status", query.status);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await axiosInstance.get(`/ebooks/admin?${params.toString()}`);
    return response.data;
  }
  // Create ebook
  static async createEbook(
    data: CreateEbookData,
    files?: {
      thumbnailImage?: File;
      pdf?: File;
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
    if (files?.pdf) {
      formData.append("pdf", files.pdf);
    }

    const response = await axiosInstance.post("/ebooks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get ebook by ID
  static async getEbookById(id: string) {
    const response = await axiosInstance.get(`/ebooks/${id}`);
    return response.data;
  }
  // Update ebook
  static async updateEbook(
    id: string,
    data: Partial<CreateEbookData>,
    files?: {
      thumbnailImage?: File;
      pdf?: File;
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
    if (files?.pdf) {
      formData.append("pdf", files.pdf);
    }

    const response = await axiosInstance.put(`/ebooks/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Delete ebook
  static async deleteEbook(id: string) {
    const response = await axiosInstance.delete(`/ebooks/${id}`);
    return response.data;
  }

  // Publish ebook
  static async publishEbook(id: string, publishedAt?: string) {
    const response = await axiosInstance.patch(`/ebooks/${id}/publish`, {
      publishedAt,
    });
    return response.data;
  }

  // Unpublish ebook
  static async unpublishEbook(id: string) {
    const response = await axiosInstance.patch(`/ebooks/${id}/unpublish`);
    return response.data;
  }

  // Get ebook statistics
  static async getEbookStatistics(): Promise<{ data: EbookStats }> {
    const response = await axiosInstance.get("/ebooks/admin/statistics");
    return response.data;
  }

  // Get ebook categories
  static async getEbookCategories() {
    const response = await axiosInstance.get("/ebooks/categories");
    return response.data;
  }

  // Search ebooks
  static async searchEbooks(query: string, filters?: Partial<EbookQuery>) {
    const params = new URLSearchParams();
    params.append("q", query);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);

    const response = await axiosInstance.get(`/ebooks/search?${params.toString()}`);
    return response.data;
  }
}
