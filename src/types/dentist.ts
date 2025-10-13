export interface Dentist {
  id: string;
  clinicName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  openingHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  description?: string;
  specialties?: string[];
  website?: string;
  isActive: boolean;
  isVerified: boolean;
  userId: string;
  user: {
    id: string;
    firstName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DentistStatistics {
  totalDentists: number;
  verifiedDentists: number;
  activeDentists: number;
  unverifiedDentists: number;
  popularCities: Array<{
    city: string;
    _count: {
      city: number;
    };
  }>;
}

export interface DentistQueryParams {
  city?: string;
  state?: string;
  search?: string;
  specialty?: string;
  page?: number;
  limit?: number;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface DentistListResponse {
  success: boolean;
  message: string;
  data: Dentist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface VerifyDentistRequest {
  isVerified: boolean;
}
