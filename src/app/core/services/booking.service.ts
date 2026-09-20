import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingDto, CreateBookingDto } from '../models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BookingDto[]> {
    return this.http.get<BookingDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<BookingDto> {
    return this.http.get<BookingDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBookingDto): Observable<BookingDto> {
    return this.http.post<BookingDto>(this.baseUrl, dto);
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
