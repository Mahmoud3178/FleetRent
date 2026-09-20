import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractService } from '../../core/services/contract.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ContractDto } from '../../core/models/contract.models';
import { BookingDto } from '../../core/models/booking.models';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css'
})
export class ContractsComponent implements OnInit {
  loading = signal(true);
  contracts = signal<ContractDto[]>([]);
  confirmedBookings = signal<BookingDto[]>([]);

  showCheckoutModal = signal(false);
  showCheckinModal = signal(false);
  submitting = signal(false);
  activeContractId = signal<number | null>(null);

  checkoutForm!: FormGroup;
  checkinForm!: FormGroup;

  constructor(
    private contractService: ContractService,
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      bookingId: [null as number | null, Validators.required],
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
    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.bookingService.getAll().subscribe({
      next: (data) =>
        this.confirmedBookings.set(data.filter((b) => b.status === 'Confirmed' || b.status === 'Pending'))
    });
  }

  openCheckout() {
    this.checkoutForm.reset({ bookingId: null, pickupMileage: 0 });
    this.showCheckoutModal.set(true);
  }

  submitCheckout() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.checkoutForm.getRawValue();

    this.contractService
      .checkOut({
        bookingId: value.bookingId!,
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

  openCheckin(contractId: number) {
    this.activeContractId.set(contractId);
    this.checkinForm.reset({ returnMileage: 0, hasDamage: false, damageNotes: '', estimatedDamageCost: 0 });
    this.showCheckinModal.set(true);
  }

  submitCheckin() {
    const contractId = this.activeContractId();
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
    return status === 'Active' ? 'badge-info' : 'badge-success';
  }
}
