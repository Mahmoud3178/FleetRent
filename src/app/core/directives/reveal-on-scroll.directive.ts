import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

/**
 * appReveal: بتضيف كلاس "in-view" للعنصر لما يدخل الشاشة أثناء السكرول،
 * وده بيفعّل الأنيميشن المعرّف في CSS (fade-up / scale-in / إلخ).
 * استخدام: <div appReveal>...</div>  أو  <div appReveal="scale">...</div>
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input('appReveal') variant: 'up' | 'scale' | 'fade' = 'up';
  @Input() revealDelay = 0;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('reveal', `reveal-${this.variant}`);
    if (this.revealDelay) {
      element.style.transitionDelay = `${this.revealDelay}ms`;
    }

    // لو المتصفح مش بيدعم IntersectionObserver لأي سبب، نظهر العنصر على طول
    // بدل ما يفضل مخفي للأبد
    if (!('IntersectionObserver' in window)) {
      element.classList.add('in-view');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('in-view');
            this.observer?.unobserve(element);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
