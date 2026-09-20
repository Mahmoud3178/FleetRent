import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarCategoryDto, CreateCarCategoryDto } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class CarCategoryService {
  private baseUrl = `${environment.apiUrl}/carcategories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CarCategoryDto[]> {
    return this.http.get<CarCategoryDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CarCategoryDto> {
    return this.http.get<CarCategoryDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateCarCategoryDto): Observable<CarCategoryDto> {
    return this.http.post<CarCategoryDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CreateCarCategoryDto): Observable<CarCategoryDto> {
    return this.http.put<CarCategoryDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
