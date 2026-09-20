import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

/**
 * appCountUp: بيعمل عدّاد متحرك من 0 للرقم المطلوب لما العنصر يدخل الشاشة.
 * استخدام: <span appCountUp [countTo]="500" suffix="+">0</span>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input() countTo = 0;
  @Input() duration = 1400;
  @Input() suffix = '';

  private observer?: IntersectionObserver;
  private started = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;

    if (!('IntersectionObserver' in window)) {
      element.textContent = `${this.countTo}${this.suffix}`;
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.started) {
            this.started = true;
            this.animate();
            this.observer?.unobserve(element);
          }
        });
      },
      { threshold: 0.4 }
    );
    this.observer.observe(element);
  }

  private animate() {
    const element = this.el.nativeElement;
    const start = performance.now();
    const target = this.countTo;

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.duration, 1);
      // easeOutCubic - بيبطئ في الآخر بدل سرعة ثابتة، بيحس المستخدم إنه "استقر"
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = `${value.toLocaleString()}${this.suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
