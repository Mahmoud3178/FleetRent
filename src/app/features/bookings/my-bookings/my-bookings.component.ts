import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingDto } from '../../../core/models/booking.models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent implements OnInit {
  loading = signal(true);
  cancelingId = signal<number | null>(null);
  allBookings = signal<BookingDto[]>([]);

  myBookings = computed(() =>
    this.allBookings().filter((b) => b.customerId === this.auth.userId())
  );

  constructor(
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.allBookings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cancel(id: number) {
    this.cancelingId.set(id);
    this.bookingService.cancel(id).subscribe({
      next: () => {
        this.toast.success('تم إلغاء الحجز');
        this.cancelingId.set(null);
        this.load();
      },
      error: (err) => {
        this.cancelingId.set(null);
        this.toast.error(this.toast.extractError(err));
      }
    });
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-muted';
    }
  }
}
