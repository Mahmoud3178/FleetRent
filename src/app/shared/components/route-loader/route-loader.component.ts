import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route-loader',
  standalone: true,
  template: `
    @if (loading) {
      <div class="route-loader-overlay">
        <span class="route-loader-car">🚗</span>
        <div class="route-loader-track"></div>
        <span class="route-loader-text">FleetRent is loading…</span>
      </div>
    }
  `
})
export class RouteLoaderComponent implements OnDestroy {
  loading = false;
  private sub: Subscription;

  // بيعرض شاشة "عربية بتلف" أثناء الانتقال بين الصفحات، مش بس أول ما الموقع
  // يفتح - وده اللي بيدي الإحساس إن الموقع "حي" وبيحمّل حاجة فعلية كل مرة
  constructor(private router: Router) {
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // شوية تأخير بسيط عشان الأنيميشن ميومضش (flash) في الانتقالات السريعة جدًا
        setTimeout(() => (this.loading = false), 250);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
