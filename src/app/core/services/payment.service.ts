import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentDto, PaymentDto } from '../models/misc.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(this.baseUrl);
  }

  create(dto: CreatePaymentDto): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(this.baseUrl, dto);
  }
}
