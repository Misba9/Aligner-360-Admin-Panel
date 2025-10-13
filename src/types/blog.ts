export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  readingTime?: number;
  isForDentist: boolean;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  status: "DRAFT" | "PUBLISHED";
  tags?: string[];
  isForDentist: boolean;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags?: string[];
  isForDentist?: boolean;
}

export interface BlogListResponse {
  success: boolean;
  data: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogResponse {
  success: boolean;
  message: string;
  data: Blog;
}
