import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BranchDto, CreateBranchDto } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private baseUrl = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BranchDto[]> {
    return this.http.get<BranchDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<BranchDto> {
    return this.http.get<BranchDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBranchDto): Observable<BranchDto> {
    return this.http.post<BranchDto>(this.baseUrl, dto);
  }
}
