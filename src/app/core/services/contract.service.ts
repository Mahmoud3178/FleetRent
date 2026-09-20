import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckInDto, CheckOutDto, ContractDto, ContractSummaryDto } from '../models/contract.models';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private baseUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ContractDto[]> {
    return this.http.get<ContractDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<ContractDto> {
    return this.http.get<ContractDto>(`${this.baseUrl}/${id}`);
  }

  checkOut(dto: CheckOutDto): Observable<ContractDto> {
    return this.http.post<ContractDto>(`${this.baseUrl}/checkout`, dto);
  }

  checkIn(dto: CheckInDto): Observable<ContractSummaryDto> {
    return this.http.post<ContractSummaryDto>(`${this.baseUrl}/checkin`, dto);
  }
}
