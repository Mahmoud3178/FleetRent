import { BookingStatus } from './enums';

export interface BookingDto {
  id: number;
  customerId: number;
  customerName: string;
  carId: number;
  carPlateNumber: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  estimatedCost: number;
}

export interface CreateBookingDto {
  customerId: number;
  carId: number;
  startDate: string;
  endDate: string;
}
