import axiosInstance from "@/lib/axios";
import { LoginFormData, SignupFormData, AuthResponse } from "@/types/auth";

export class AuthService {
  static async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  }

  static async signup(data: SignupFormData): Promise<AuthResponse> {
    const signupData = {
      ...data,
      role: "admin" as const,
    };
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
  }

  static async logout(): Promise<void> {
    await axiosInstance.post("/auth/logout");
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await axiosInstance.get("/auth/get-logged-in-user");
    return response.data;
  }

  static async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await axiosInstance.post("/auth/verify-email", { token });
    return response.data;
  }
}
