import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchService } from '../../core/services/branch.service';
import { ToastService } from '../../core/services/toast.service';
import { BranchDto } from '../../core/models/branch.models';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {
  loading = signal(true);
  branches = signal<BranchDto[]>([]);
  showModal = signal(false);
  submitting = signal(false);

  form!: FormGroup;

  constructor(
    private branchService: BranchService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required]
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.branchService.getAll().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal() {
    this.form.reset();
    this.showModal.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.branchService.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('تمت إضافة الفرع بنجاح');
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
}
