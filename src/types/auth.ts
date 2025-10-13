export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "dentist" | "patient";
  phone?: string;
  isEmailVerified: boolean;
  type?: "DENTIST" | "ORTHODONTIST";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  dci_registration_number?: string;
  showOnMap?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
