import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { CarDto } from '../../core/models/car.models';
import { toFullImageUrl } from '../../core/utils/image-url';
import { RevealOnScrollDirective } from '../../core/directives/reveal-on-scroll.directive';
import { CountUpDirective } from '../../core/directives/count-up.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective, CountUpDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  cars = signal<CarDto[]>([]);
  loading = signal(true);

  // شهادات عملاء (Placeholder illustrative — أسماء وصور عامة، مش شخصيات حقيقية)
  testimonials = [
    { name: 'Mona Farid', role: 'Frequent renter', quote: 'Booking took two minutes and the car was ready exactly on time at the branch.', avatar: '👩🏽' },
    { name: 'Karim Adel', role: 'Business traveler', quote: 'Transparent pricing, no surprise fees at checkout. Exactly what I needed for a work trip.', avatar: '👨🏻' },
    { name: 'Salma Nabil', role: 'Weekend driver', quote: 'The whole pickup and return process felt fast and organized — way better than I expected.', avatar: '👩🏻' }
  ];

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.carService.getAll().subscribe({
      next: (data) => {
        this.cars.set(data.filter((c) => c.status === 'Available').slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  fullImageUrl(url: string | null | undefined): string | null {
    return toFullImageUrl(url);
  }
}
