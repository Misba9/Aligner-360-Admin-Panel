import axiosInstance from "@/lib/axios";

export interface CaseStudy {
  id: string;
  name: string;
  age: string;
  case: string;
  gender: "M" | "F";
  upper: string;
  lower: string;
  imageBefore: string;
  imageAfter: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseStudyData {
  name: string;
  age: string;
  case: string;
  gender: "M" | "F";
  upper: string;
  lower: string;
  imageBefore?: File;
  imageAfter?: File;
}

export interface UpdateCaseStudyData {
  name?: string;
  age?: string;
  case?: string;
  gender?: "M" | "F";
  upper?: string;
  lower?: string;
  imageBefore?: File;
  imageAfter?: File;
}

export interface CaseStudyQuery {
  page?: number;
  limit?: number;
  search?: string;
  gender?: "M" | "F";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class AdminCaseStudyService {
  // Get all case studies (admin view)
  static async getAllCaseStudies(query?: CaseStudyQuery) {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.gender) params.append("gender", query.gender);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const response = await axiosInstance.get(`/case-studies/admin?${params.toString()}`);
    return response.data;
  }

  // Create case study
  static async createCaseStudy(
    data: CreateCaseStudyData,
    files?: {
      imageBefore?: File;
      imageAfter?: File;
    }
  ) {
    const formData = new FormData();

    // Append text fields
    formData.append("name", data.name);
    formData.append("age", data.age);
    formData.append("case", data.case);
    formData.append("gender", data.gender);
    formData.append("upper", data.upper);
    formData.append("lower", data.lower);

    // Append files
    if (files?.imageBefore) {
      formData.append("imageBefore", files.imageBefore);
    }
    if (files?.imageAfter) {
      formData.append("imageAfter", files.imageAfter);
    }

    const response = await axiosInstance.post("/case-studies", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get case study by ID
  static async getCaseStudyById(id: string) {
    const response = await axiosInstance.get(`/case-studies/${id}`);
    return response.data;
  }

  // Update case study
  static async updateCaseStudy(
    id: string,
    data: UpdateCaseStudyData,
    files?: {
      imageBefore?: File;
      imageAfter?: File;
    }
  ) {
    const formData = new FormData();

    // Append text fields only if they exist
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.age !== undefined) formData.append("age", data.age);
    if (data.case !== undefined) formData.append("case", data.case);
    if (data.gender !== undefined) formData.append("gender", data.gender);
    if (data.upper !== undefined) formData.append("upper", data.upper);
    if (data.lower !== undefined) formData.append("lower", data.lower);

    // Append files if provided
    if (files?.imageBefore) {
      formData.append("imageBefore", files.imageBefore);
    }
    if (files?.imageAfter) {
      formData.append("imageAfter", files.imageAfter);
    }

    const response = await axiosInstance.put(`/case-studies/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Delete case study
  static async deleteCaseStudy(id: string) {
    const response = await axiosInstance.delete(`/case-studies/${id}`);
    return response.data;
  }
}
