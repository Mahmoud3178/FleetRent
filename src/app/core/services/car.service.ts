import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarDto, CreateCarDto, UpdateCarDto, UploadImagesResponse } from '../models/car.models';

/** لازم تفضل متطابقة مع القيم المسموحة في الـ Backend (CarsController) */
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable({ providedIn: 'root' })
export class CarService {
  private baseUrl = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CarDto[]> {
    return this.http.get<CarDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CarDto> {
    return this.http.get<CarDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateCarDto): Observable<CarDto> {
    return this.http.post<CarDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateCarDto): Observable<CarDto> {
    return this.http.put<CarDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** رفع كذا صورة مرة واحدة لعربية معينة */
  uploadImages(carId: number, files: File[]): Observable<UploadImagesResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<UploadImagesResponse>(`${this.baseUrl}/${carId}/upload-images`, formData);
  }

  deleteImage(carId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${carId}/images/${imageId}`);
  }

  setPrimaryImage(carId: number, imageId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${carId}/images/${imageId}/set-primary`, {});
  }

  /** تحقق من نوع وحجم الصورة قبل الرفع، بنفس قواعد الـ Backend بالظبط */
  validateImageFile(file: File): string | null {
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return `نوع الملف غير مسموح: ${file.name}. الأنواع المسموحة: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`;
    }
    if (file.size === 0) {
      return `الملف فارغ: ${file.name}`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `حجم الصورة كبير جدًا: ${file.name} (الحد الأقصى 5 ميجا)`;
    }
    return null;
  }
}
