import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../../core/services/car.service';
import { BranchService } from '../../../core/services/branch.service';
import { CarCategoryService } from '../../../core/services/car-category.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarDto } from '../../../core/models/car.models';
import { BranchDto, CarCategoryDto } from '../../../core/models/branch.models';
import { BookingDto } from '../../../core/models/booking.models';
import { toFullImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.css'
})
export class CarListComponent implements OnInit {
  cars = signal<CarDto[]>([]);
  branches = signal<BranchDto[]>([]);
  categories = signal<CarCategoryDto[]>([]);
  bookings = signal<BookingDto[]>([]);
  loading = signal(true);
  deletingId = signal<number | null>(null);

  searchTerm = signal('');
  branchFilter = signal<number | null>(null);
  categoryFilter = signal<number | null>(null);
  statusFilter = signal<string>('Available');

  filteredCars = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const branchId = this.branchFilter();
    const categoryId = this.categoryFilter();
    const status = this.statusFilter();

    return this.cars().filter((c) => {
      const matchesTerm =
        !term ||
        c.brand.toLowerCase().includes(term) ||
        c.model.toLowerCase().includes(term) ||
        c.plateNumber.toLowerCase().includes(term);
      const matchesBranch = !branchId || c.branchId === branchId;
      const matchesCategory = !categoryId || c.carCategoryId === categoryId;
      const matchesStatus = status === 'All' || c.status === status;
      return matchesTerm && matchesBranch && matchesCategory && matchesStatus;
    });
  });

  constructor(
    private carService: CarService,
    private branchService: BranchService,
    private categoryService: CarCategoryService,
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // الأدمن/الموظف لازم يشوف كل العربيات بكل حالاتها (Rented / UnderMaintenance)
    // مش بس المتاحة، عشان يقدر يدير الأسطول كله. العميل العادي لسه بيشوف
    // "Available" بس افتراضيًا لأنه جاي يحجز مش يدير.
    if (this.canManage) {
      this.statusFilter.set('All');
    }

    this.carService.getAll().subscribe({
      next: (data) => {
        this.cars.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.categoryService.getAll().subscribe({ next: (data) => this.categories.set(data) });

    // مفيش /bookings غير للمستخدمين اللي عاملين تسجيل دخول (Authorize على الكونترولر).
    // للزائر مش المسجل دخول، بنكتفي بعرض حالة العربية (Available/Rented/UnderMaintenance)
    // من غير تفاصيل تواريخ الحجز.
    if (this.auth.isLoggedIn()) {
      this.bookingService.getAll().subscribe({ next: (data) => this.bookings.set(data) });
    }
  }

  // بيرجع أقرب حجز فعّال (Pending أو Confirmed) على العربية دي، عشان نعرض
  // "Booked: من تاريخ - لتاريخ" بدل ما نسيب العربية من غير أي تفاصيل زمنية.
  activeBookingFor(carId: number): BookingDto | undefined {
    return this.bookings()
      .filter((b) => b.carId === carId && (b.status === 'Pending' || b.status === 'Confirmed'))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  }

  get canManage(): boolean {
    return this.auth.hasRole('Admin', 'Employee');
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'Rented': return 'badge-warning';
      case 'UnderMaintenance': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  fullImageUrl(url: string | null | undefined): string | null {
    return toFullImageUrl(url);
  }

  // لو الصورة فشلت تتحمل (رابط قديم/محذوف من Cloudinary مثلاً)، منعرضش
  // أيقونة الصورة المكسورة ولا الـ alt text بخط كبير - بنخفي الـ <img> بس
  // والإيموجي البديل 🚗 اللي في .car-thumb (background) هو اللي هيبان مكانها.
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  deleteCar(event: Event, car: CarDto) {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm(`متأكد إنك عايز تمسح عربية ${car.brand} ${car.model} (${car.plateNumber})؟\n\nالإجراء ده لا يمكن التراجع عنه، وهيمسح معاه أي حجوزات وعقود وسجلات صيانة مرتبطة بالعربية دي.`)) {
      return;
    }

    this.deletingId.set(car.id);
    this.carService.delete(car.id).subscribe({
      next: () => {
        this.cars.update((list) => list.filter((c) => c.id !== car.id));
        this.toast.success('تم حذف العربية بنجاح');
        this.deletingId.set(null);
      },
      error: (err) => {
        this.toast.error(this.toast.extractError(err));
        this.deletingId.set(null);
      }
    });
  }
}
