import axiosInstance from "@/lib/axios";
import { Blog, CreateBlogRequest, UpdateBlogRequest, BlogListResponse, BlogResponse } from "@/types/blog";

export class BlogService {
  static async getAllBlogs(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<BlogListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const response = await axiosInstance.get(`/blogs?${queryParams.toString()}`);
    return response.data;
  }

  static async getBlogById(id: string): Promise<BlogResponse> {
    const response = await axiosInstance.get(`/blogs/${id}/admin`);
    return response.data;
  }

  static async createBlog(data: CreateBlogRequest): Promise<BlogResponse> {
    const response = await axiosInstance.post("/blogs", data);
    return response.data;
  }

  static async updateBlog(id: string, data: UpdateBlogRequest): Promise<BlogResponse> {
    const response = await axiosInstance.put(`/blogs/${id}`, data);
    return response.data;
  }

  static async deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/blogs/${id}`);
    return response.data;
  }

  static async publishBlog(id: string): Promise<BlogResponse> {
    const response = await axiosInstance.patch(`/blogs/${id}/publish`);
    return response.data;
  }

  static async unpublishBlog(id: string): Promise<BlogResponse> {
    const response = await axiosInstance.patch(`/blogs/${id}/unpublish`);
    return response.data;
  }
  static async getBlogStatistics(): Promise<{
    success: boolean;
    data: {
      totalBlogs: number;
      publishedBlogs: number;
      draftBlogs: number;
      archivedBlogs: number;
      totalViews: number;
      totalLikes: number;
    };
  }> {
    const response = await axiosInstance.get("/blogs/admin/statistics");
    return response.data;
  }

  static async getBlogCategories(): Promise<{
    success: boolean;
    data: string[];
    message: string;
  }> {
    const response = await axiosInstance.get("/blogs/categories");
    return response.data;
  }
}
