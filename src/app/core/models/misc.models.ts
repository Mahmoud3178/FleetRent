export interface PaymentDto {
  id: number;
  rentalContractId: number;
  amount: number;
  type: 'Deposit' | 'RentalFee' | 'PenaltyFee';
  paidAt: string;
}

export interface CreatePaymentDto {
  rentalContractId: number;
  amount: number;
  type: 'Deposit' | 'RentalFee' | 'PenaltyFee';
}

export interface MaintenanceRecordDto {
  id: number;
  carId: number;
  carPlateNumber: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  cost: number;
}

export interface CreateMaintenanceRecordDto {
  carId: number;
  description: string;
  startDate: string;
  cost: number;
}
