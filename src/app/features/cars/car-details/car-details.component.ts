import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../../../core/services/car.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarDto } from '../../../core/models/car.models';
import { BookingDto } from '../../../core/models/booking.models';
import { toFullImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css'
})
export class CarDetailsComponent implements OnInit {
  car = signal<CarDto | null>(null);
  loading = signal(true);
  booking = signal(false);
  activeImageIndex = signal(0);
  activeBooking = signal<BookingDto | null>(null);

  form!: FormGroup;

  estimatedDays = computed(() => {
    const { startDate, endDate } = this.form.getRawValue();
    if (!startDate || !endDate) return 0;
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
    );
    return days > 0 ? days : 0;
  });

  estimatedCost = computed(() => {
    const days = this.estimatedDays() || 1;
    const rate = this.car()?.dailyRate ?? 0;
    return this.estimatedDays() > 0 ? days * rate : 0;
  });

  /** الصورة الأساسية أول واحدة في القائمة، والباقي بترتيبهم */
  orderedImages = computed(() => {
    const images = this.car()?.images ?? [];
    if (images.length === 0) return [];
    const primary = images.find((i) => i.isPrimary);
    const rest = images.filter((i) => !i.isPrimary);
    return primary ? [primary, ...rest] : images;
  });

  activeImageUrl = computed(() => {
    const images = this.orderedImages();
    if (images.length === 0) return null;
    const index = Math.min(this.activeImageIndex(), images.length - 1);
    return toFullImageUrl(images[index].imageUrl);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getById(id).subscribe({
      next: (data) => {
        this.car.set(data);
        this.loading.set(false);
        this.loadActiveBooking(id);
      },
      error: () => this.loading.set(false)
    });
  }

  // مفيش /bookings غير لمستخدم مسجل دخول (Authorize على الكونترولر). لو العربية
  // مش Available، بنجيب أقرب حجز فعّال (Pending/Confirmed) عليها عشان نعرض
  // للزائر/الأدمن التواريخ المحجوزة بدل ما يشوف "غير متاحة" من غير أي تفاصيل.
  private loadActiveBooking(carId: number) {
    if (!this.auth.isLoggedIn()) return;

    this.bookingService.getAll().subscribe({
      next: (bookings) => {
        const match = bookings
          .filter((b) => b.carId === carId && (b.status === 'Pending' || b.status === 'Confirmed'))
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
        this.activeBooking.set(match ?? null);
      }
    });
  }

  submitBooking() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('سجل دخولك الأول عشان تقدر تحجز');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const car = this.car();
    if (!car) return;

    this.booking.set(true);
    const { startDate, endDate } = this.form.getRawValue();

    this.bookingService
      .create({
        customerId: this.auth.userId()!,
        carId: car.id,
        startDate: startDate!,
        endDate: endDate!
      })
      .subscribe({
        next: () => {
          this.toast.success('تم إنشاء الحجز بنجاح! راجع "My Bookings"');
          this.router.navigate(['/bookings/my']);
        },
        error: (err) => {
          this.booking.set(false);
          this.toast.error(this.toast.extractError(err));
        }
      });
  }

  selectImage(index: number) {
    this.activeImageIndex.set(index);
  }

  toFullUrl(url: string): string | null {
    return toFullImageUrl(url);
  }

  // نفس فكرة car-list: لو الصورة فشلت تتحمل بنخفيها بدل ما البراوزر
  // يعرض الـ alt text بخط كبير مكانها (font-size: 90px بتاع fallback الإيموجي).
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
