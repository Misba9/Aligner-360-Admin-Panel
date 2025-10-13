import axiosInstance from "@/lib/axios";

export interface AlignerProcess {
  id: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessResponse {
  success: boolean;
  message: string;
  data: AlignerProcess | null;
}

export class ProcessService {
  static async getProcess(): Promise<ProcessResponse> {
    const response = await axiosInstance.get("/process");
    return response.data;
  }

  static async updateProcess(formData: FormData): Promise<ProcessResponse> {
    const response = await axiosInstance.put("/process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}
