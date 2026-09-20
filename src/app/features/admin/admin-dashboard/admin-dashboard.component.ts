import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { BranchService } from '../../../core/services/branch.service';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { CarDto } from '../../../core/models/car.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  loading = signal(true);

  totalCars = signal(0);
  availableCars = signal(0);
  totalBranches = signal(0);
  totalUsers = signal(0);
  totalBookings = signal(0);
  pendingBookings = signal(0);

  constructor(
    private carService: CarService,
    private branchService: BranchService,
    private userService: UserService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.carService.getAll().subscribe({
      next: (data: CarDto[]) => {
        this.totalCars.set(data.length);
        this.availableCars.set(data.filter((c) => c.status === 'Available').length);
      }
    });

    this.branchService.getAll().subscribe({ next: (data) => this.totalBranches.set(data.length) });
    this.userService.getAll().subscribe({ next: (data) => this.totalUsers.set(data.length) });

    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.totalBookings.set(data.length);
        this.pendingBookings.set(data.filter((b) => b.status === 'Pending').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
