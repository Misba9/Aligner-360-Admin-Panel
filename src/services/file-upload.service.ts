import axiosInstance from "@/lib/axios";

export class FileUploadService {
  static async uploadFile({ file, folder, tags }: { file: File; folder: string; tags?: string[] }): Promise<{ fileId: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      if (tags && tags.length > 0) {
        // Backend expects comma-separated string, not JSON
        formData.append("tags", tags.join(","));
      }
      // Don't set Content-Type manually - let axios handle it for FormData
      const response = await axiosInstance.post("/image-kit/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Upload error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  }

  static async uploadFromUrl({
    url,
    fileName,
    folder,
    useUniqueFileName,
    tags,
  }: {
    url: string;
    fileName: string;
    folder?: string;
    useUniqueFileName?: boolean;
    tags?: string[];
  }): Promise<{ fileId: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append("url", url);
      formData.append("fileName", fileName);
      if (folder) {
        formData.append("folder", folder);
      }
      if (useUniqueFileName) {
        formData.append("useUniqueFileName", JSON.stringify(useUniqueFileName));
      }
      if (tags) {
        formData.append("tags", JSON.stringify(tags));
      }

      const response = await axiosInstance.post("/image-kit/upload-from-url", formData, {
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      console.error("Upload from URL error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw error;
    }
  }
  static async getFileDetails(fileId: string) {
    const response = await axiosInstance.get(`/image-kit/file/${fileId}`);
    return response.data;
  }
}
