import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMaintenanceRecordDto, MaintenanceRecordDto } from '../models/misc.models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private baseUrl = `${environment.apiUrl}/maintenancerecords`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MaintenanceRecordDto[]> {
    return this.http.get<MaintenanceRecordDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<MaintenanceRecordDto> {
    return this.http.get<MaintenanceRecordDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateMaintenanceRecordDto): Observable<MaintenanceRecordDto> {
    return this.http.post<MaintenanceRecordDto>(this.baseUrl, dto);
  }

  complete(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/complete`, {});
  }
}
