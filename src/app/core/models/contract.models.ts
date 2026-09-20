import { ContractStatus } from './enums';

export interface ContractDto {
  id: number;
  bookingId: number;
  employeeName: string;
  actualPickupDate: string;
  actualReturnDate?: string | null;
  status: ContractStatus;
  totalAmount: number;
}

export interface CheckOutDto {
  bookingId: number;
  employeeId: number;
  pickupMileage: number;
}

export interface CheckInDto {
  contractId: number;
  returnMileage: number;
  hasDamage: boolean;
  damageNotes?: string | null;
  estimatedDamageCost: number;
}

export interface ContractSummaryDto {
  totalAmount: number;
  penaltiesApplied: string[];
}
