import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceService } from '../../core/services/maintenance.service';
import { CarService } from '../../core/services/car.service';
import { ToastService } from '../../core/services/toast.service';
import { MaintenanceRecordDto } from '../../core/models/misc.models';
import { CarDto } from '../../core/models/car.models';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css'
})
export class MaintenanceComponent implements OnInit {
  loading = signal(true);
  records = signal<MaintenanceRecordDto[]>([]);
  cars = signal<CarDto[]>([]);
  showModal = signal(false);
  submitting = signal(false);
  completingId = signal<number | null>(null);

  form!: FormGroup;

  constructor(
    private maintenanceService: MaintenanceService,
    private carService: CarService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      carId: [null as number | null, Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
    });

    this.load();
    this.carService.getAll().subscribe({ next: (data) => this.cars.set(data) });
  }

  load() {
    this.loading.set(true);
    this.maintenanceService.getAll().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal() {
    this.form.reset({ carId: null, description: '', startDate: '', cost: 0 });
    this.showModal.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.maintenanceService.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('تم تسجيل الصيانة وتحديث حالة العربية');
        this.showModal.set(false);
        this.submitting.set(false);
        this.load();
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(this.toast.extractError(err));
      }
    });
  }

  complete(id: number) {
    this.completingId.set(id);
    this.maintenanceService.complete(id).subscribe({
      next: () => {
        this.toast.success('تم إنهاء الصيانة، العربية بقت متاحة');
        this.completingId.set(null);
        this.load();
      },
      error: (err) => {
        this.completingId.set(null);
        this.toast.error(this.toast.extractError(err));
      }
    });
  }
}
