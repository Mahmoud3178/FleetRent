import { CarStatus } from './enums';

export interface CarImageDto {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface CarDto {
  id: number;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: CarStatus;
  currentMileage: number;
  branchName: string;
  categoryName: string;
  branchId?: number;
  carCategoryId?: number;
  dailyRate?: number;
  primaryImageUrl?: string | null;
  images: CarImageDto[];
}

export interface CreateCarDto {
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  branchId: number;
  carCategoryId: number;
}

export interface UpdateCarDto {
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  branchId: number;
  carCategoryId: number;
  status: CarStatus;
  currentMileage: number;
}

export interface UploadImagesResponse {
  imageUrls: string[];
}
