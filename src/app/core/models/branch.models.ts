export interface BranchDto {
  id: number;
  name: string;
  city: string;
  address: string;
}

export interface CreateBranchDto {
  name: string;
  city: string;
  address: string;
}

export interface CarCategoryDto {
  id: number;
  name: string;
  dailyRate: number;
}

export interface CreateCarCategoryDto {
  name: string;
  dailyRate: number;
}
