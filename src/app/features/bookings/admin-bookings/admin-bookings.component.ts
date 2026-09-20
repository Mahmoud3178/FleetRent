import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { ContractService } from '../../../core/services/contract.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingDto } from '../../../core/models/booking.models';
import { ContractDto } from '../../../core/models/contract.models';

// بيربط كل حجز بالعقد المرتبط بيه (لو موجود) عشان نعرف نعرض زرار
// Check-out ولا Check-in ولا مفيش حاجة (لو اتلغى أو خلص)
interface BookingRow extends BookingDto {
  contract?: ContractDto;
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css'
})
export class AdminBookingsComponent implements OnInit {
  loading = signal(true);
  bookings = signal<BookingDto[]>([]);
  contracts = signal<ContractDto[]>([]);
  statusFilter = signal<string>('All');

  showCheckoutModal = signal(false);
  showCheckinModal = signal(false);
  submitting = signal(false);
  activeBooking = signal<BookingRow | null>(null);

  checkoutForm!: FormGroup;
  checkinForm!: FormGroup;

  // الحجوزات مع العقد المرتبط بيها (لو الحجز Confirmed يبقى أكيد فيه عقد Active
  // مرتبط بيه، لأن الحالة دي مش بتتحط غير جوه CheckOutCarAsync في الباك إند)
  rows = computed<BookingRow[]>(() => {
    const contracts = this.contracts();
    return this.bookings()
      .map((b) => ({
        ...b,
        contract: contracts.find((c) => c.bookingId === b.id && c.status === 'Active')
      }))
      .sort((a, b) => b.id - a.id);
  });

  filteredRows = computed<BookingRow[]>(() => {
    const filter = this.statusFilter();
    const rows = this.rows();
    return filter === 'All' ? rows : rows.filter((r) => r.status === filter);
  });

  constructor(
    private bookingService: BookingService,
    private contractService: ContractService,
    public auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      pickupMileage: [0, [Validators.required, Validators.min(0)]]
    });

    this.checkinForm = this.fb.group({
      returnMileage: [0, [Validators.required, Validators.min(0)]],
      hasDamage: [false],
      damageNotes: [''],
      estimatedDamageCost: [0]
    });

    this.load();
  }

  load() {
    this.loading.set(true);
    this.bookingService.getAll().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.contractService.getAll().subscribe({
      next: (data) => this.contracts.set(data)
    });
  }

  // ===== Check-out (تسليم العربية وفتح عقد جديد) =====
  openCheckout(row: BookingRow) {
    this.activeBooking.set(row);
    this.checkoutForm.reset({ pickupMileage: 0 });
    this.showCheckoutModal.set(true);
  }

  submitCheckout() {
    const booking = this.activeBooking();
    if (!booking || this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const value = this.checkoutForm.getRawValue();

    this.contractService
      .checkOut({
        bookingId: booking.id,
        employeeId: this.auth.userId()!,
        pickupMileage: value.pickupMileage!
      })
      .subscribe({
        next: () => {
          this.toast.success('تم تسليم العربية وفتح العقد بنجاح');
          this.showCheckoutModal.set(false);
          this.submitting.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(this.toast.extractError(err));
        }
      });
  }

  // ===== Check-in (استلام العربية وقفل العقد) =====
  openCheckin(row: BookingRow) {
    this.activeBooking.set(row);
    this.checkinForm.reset({ returnMileage: 0, hasDamage: false, damageNotes: '', estimatedDamageCost: 0 });
    this.showCheckinModal.set(true);
  }

  submitCheckin() {
    const booking = this.activeBooking();
    const contractId = booking?.contract?.id;
    if (!contractId || this.checkinForm.invalid) {
      this.checkinForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const value = this.checkinForm.getRawValue();

    this.contractService
      .checkIn({
        contractId,
        returnMileage: value.returnMileage!,
        hasDamage: !!value.hasDamage,
        damageNotes: value.damageNotes || null,
        estimatedDamageCost: value.estimatedDamageCost || 0
      })
      .subscribe({
        next: (summary) => {
          this.toast.success(
            `تم استلام العربية. الإجمالي النهائي: ${summary.totalAmount} EGP` +
              (summary.penaltiesApplied.length ? ` — ${summary.penaltiesApplied.join(', ')}` : '')
          );
          this.showCheckinModal.set(false);
          this.submitting.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
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
