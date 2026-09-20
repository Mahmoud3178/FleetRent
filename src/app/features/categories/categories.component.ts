import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarCategoryService } from '../../core/services/car-category.service';
import { ToastService } from '../../core/services/toast.service';
import { CarCategoryDto } from '../../core/models/branch.models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  loading = signal(true);
  categories = signal<CarCategoryDto[]>([]);
  showModal = signal(false);
  submitting = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  form!: FormGroup;

  constructor(
    private categoryService: CarCategoryService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      dailyRate: [0, [Validators.required, Validators.min(1)]]
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal() {
    this.editingId.set(null);
    this.form.reset({ name: '', dailyRate: 0 });
    this.showModal.set(true);
  }

  // بيفتح نفس المودال بس معبّي ببيانات الفئة الحالية، عشان تقدر تغيّر السعر
  // اليومي بتاعها - ده كان مفقود خالص قبل كده (Create بس، من غير Edit)
  openEditModal(category: CarCategoryDto) {
    this.editingId.set(category.id);
    this.form.reset({ name: category.name, dailyRate: category.dailyRate });
    this.showModal.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue() as any;
    const editingId = this.editingId();

    const request$ = editingId
      ? this.categoryService.update(editingId, value)
      : this.categoryService.create(value);

    request$.subscribe({
      next: () => {
        this.toast.success(editingId ? 'تم تحديث الفئة بنجاح' : 'تمت إضافة الفئة بنجاح');
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

  deleteCategory(category: CarCategoryDto) {
    if (!confirm(`متأكد إنك عايز تمسح فئة "${category.name}"؟\n\nلو فيه عربيات مرتبطة بيها، المسح هيترفض وهيطلب منك تنقلهم لفئة تانية الأول.`)) {
      return;
    }

    this.deletingId.set(category.id);
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== category.id));
        this.toast.success('تم حذف الفئة بنجاح');
        this.deletingId.set(null);
      },
      error: (err) => {
        this.toast.error(this.toast.extractError(err));
        this.deletingId.set(null);
      }
    });
  }
}
