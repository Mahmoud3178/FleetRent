import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentDto } from '../../core/models/misc.models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  loading = signal(true);
  payments = signal<PaymentDto[]>([]);

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  typeBadge(type: string): string {
    switch (type) {
      case 'Deposit': return 'badge-info';
      case 'PenaltyFee': return 'badge-danger';
      default: return 'badge-success';
    }
  }
}
