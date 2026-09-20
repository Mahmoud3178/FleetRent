import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CarService } from '../../../core/services/car.service';
import { BranchService } from '../../../core/services/branch.service';
import { CarCategoryService } from '../../../core/services/car-category.service';
import { ToastService } from '../../../core/services/toast.service';
import { BranchDto, CarCategoryDto } from '../../../core/models/branch.models';
import { CarImageDto } from '../../../core/models/car.models';
import { CarStatus } from '../../../core/models/enums';
import { toFullImageUrl } from '../../../core/utils/image-url';

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-form.component.html',
  styleUrl: './car-form.component.css'
})
export class CarFormComponent implements OnInit {
  saving = signal(false);
  loading = signal(false);
  branches = signal<BranchDto[]>([]);
  categories = signal<CarCategoryDto[]>([]);
  imagePreviews = signal<ImagePreview[]>([]);

  carId = signal<number | null>(null);
  existingImages = signal<CarImageDto[]>([]);
  busyImageId = signal<number | null>(null);

  statuses: CarStatus[] = ['Available', 'Rented', 'UnderMaintenance', 'OutOfService'] as CarStatus[];

  form!: FormGroup;

  get isEditMode(): boolean {
    return this.carId() !== null;
  }

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private branchService: BranchService,
    private categoryService: CarCategoryService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      plateNumber: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
      branchId: [null as number | null, Validators.required],
      carCategoryId: [null as number | null, Validators.required],
      status: ['Available' as CarStatus],
      currentMileage: [0, [Validators.required, Validators.min(0)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.carId.set(id);

      forkJoin({
        branches: this.branchService.getAll(),
        categories: this.categoryService.getAll()
      }).subscribe({
        next: ({ branches, categories }) => {
          this.branches.set(branches);
          this.categories.set(categories);
          this.loadCar(id);
        },
        error: () => this.loadCar(id)
      });
    } else {
      this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
      this.categoryService.getAll().subscribe({ next: (data) => this.categories.set(data) });
    }
  }

  private loadCar(id: number) {
    this.loading.set(true);
    this.carService.getById(id).subscribe({
      next: (car) => {
        this.form.patchValue({
          plateNumber: car.plateNumber,
          brand: car.brand,
          model: car.model,
          year: car.year,
          branchId: car.branchId,
          carCategoryId: car.carCategoryId,
          status: car.status,
          currentMileage: car.currentMileage
        });
        this.existingImages.set(car.images ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(this.toast.extractError(err));
        this.router.navigate(['/cars']);
      }
    });
  }

  fullImageUrl(url: string | null | undefined): string | null {
    return toFullImageUrl(url);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);
    const validFiles: ImagePreview[] = [];

    for (const file of selectedFiles) {
      const validationError = this.carService.validateImageFile(file);
      if (validationError) {
        this.toast.error(validationError);
        continue;
      }
      validFiles.push({ file, url: URL.createObjectURL(file) });
    }

    if (validFiles.length > 0) {
      this.imagePreviews.update((list) => [...list, ...validFiles]);
    }
    input.value = '';
  }

  removeImage(index: number) {
    this.imagePreviews.update((list) => {
      URL.revokeObjectURL(list[index].url);
      return list.filter((_, i) => i !== index);
    });
  }

  deleteExistingImage(image: CarImageDto) {
    const id = this.carId();
    if (id === null) return;
    if (!confirm('متأكد إنك عايز تمسح الصورة دي؟')) return;

    this.busyImageId.set(image.id);
    this.carService.deleteImage(id, image.id).subscribe({
      next: () => {
        this.existingImages.update((list) => list.filter((i) => i.id !== image.id));
        this.toast.success('تم حذف الصورة');
        this.busyImageId.set(null);
      },
      error: (err) => {
        this.toast.error(this.toast.extractError(err));
        this.busyImageId.set(null);
      }
    });
  }

  setPrimary(image: CarImageDto) {
    const id = this.carId();
    if (id === null || image.isPrimary) return;

    this.busyImageId.set(image.id);
    this.carService.setPrimaryImage(id, image.id).subscribe({
      next: () => {
        this.existingImages.update((list) =>
          list.map((i) => ({ ...i, isPrimary: i.id === image.id }))
        );
        this.toast.success('تم تحديد الصورة الأساسية');
        this.busyImageId.set(null);
      },
      error: (err) => {
        this.toast.error(this.toast.extractError(err));
        this.busyImageId.set(null);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('من فضلك راجع بيانات الفورم، في حقول مطلوبة ناقصة أو غير صحيحة');
      return;
    }

    this.saving.set(true);

    if (this.isEditMode) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate() {
    this.carService.create(this.form.getRawValue() as any).subscribe({
      next: (createdCar) => {
        const files = this.imagePreviews().map((p) => p.file);

        if (files.length === 0) {
          this.toast.success('تمت إضافة العربية بنجاح');
          this.resetForm();
          this.router.navigate(['/cars']);
          return;
        }

        this.carService.uploadImages(createdCar.id, files).subscribe({
          next: () => {
            this.toast.success(`تمت إضافة العربية مع ${files.length} صورة بنجاح`);
            this.resetForm();
            this.router.navigate(['/cars']);
          },
          error: (err) => {
            this.toast.error(
              `تمت إضافة العربية، لكن فشل رفع الصور: ${this.toast.extractError(err)}`
            );
            this.saving.set(false);
            this.router.navigate(['/admin/cars', createdCar.id, 'edit']);
          }
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(this.toast.extractError(err));
      }
    });
  }

  private submitEdit() {
    const id = this.carId()!;
    this.carService.update(id, this.form.getRawValue() as any).subscribe({
      next: () => {
        const files = this.imagePreviews().map((p) => p.file);
        if (files.length === 0) {
          this.toast.success('تم تحديث بيانات العربية بنجاح');
          this.saving.set(false);
          this.router.navigate(['/cars']);
          return;
        }

        this.carService.uploadImages(id, files).subscribe({
          next: () => {
            this.toast.success('تم تحديث بيانات العربية والصور بنجاح');
            this.imagePreviews().forEach((p) => URL.revokeObjectURL(p.url));
            this.imagePreviews.set([]);
            this.saving.set(false);
            this.router.navigate(['/cars']);
          },
          error: (err) => {
            this.toast.error(`تم تحديث بيانات العربية، لكن فشل رفع الصور الجديدة: ${this.toast.extractError(err)}`);
            this.saving.set(false);
          }
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(this.toast.extractError(err));
      }
    });
  }

  private resetForm() {
    this.form.reset({ year: new Date().getFullYear(), status: 'Available', currentMileage: 0 });
    this.imagePreviews().forEach((p) => URL.revokeObjectURL(p.url));
    this.imagePreviews.set([]);
    this.saving.set(false);
  }
}
