import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollRevealDirective]',
  standalone: true
})
export class ScrollRevealDirectiveDirective implements OnInit, OnDestroy {

  private observer?: IntersectionObserver;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const element = this.el.nativeElement;
    element.classList.add('reveal');

    // IntersectionObserver no existe durante el renderizado SSR.
    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('reveal-active');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    this.observer.observe(element);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
