import { UserRole } from './enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  userId: number;
  name: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  drivingLicenseNumber?: string | null;
  licenseExpiryDate?: string | null;
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  drivingLicenseNumber?: string | null;
  licenseExpiryDate?: string | null;
}

export interface DecodedToken {
  sub?: string;
  nameid?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  [key: string]: any;
}
