export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string | null;
  gender: string;
  is_email_verified: boolean;
  date_of_birth: string;
  address: string;
  phone_number: string;
  profile_picture?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  username?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthError {
  error: string;
  detail?: string;
  message?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  verified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
