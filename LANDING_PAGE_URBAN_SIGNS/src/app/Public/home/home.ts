import { Component, signal } from '@angular/core';
import { About } from "./about/about";
import { Servicios } from "./servicios/servicios";
import { ScrollRevealDirectiveDirective } from '../../Core/directives/scroll-reveal-directive.directive';

@Component({
  selector: 'app-home',
  imports: [About, Servicios, ScrollRevealDirectiveDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly heroX = signal(0);
  readonly heroY = signal(0);

  updateHero(event: PointerEvent, element: HTMLElement): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = element.getBoundingClientRect();
    this.heroX.set(((event.clientX - bounds.left) / bounds.width - .5) * 2);
    this.heroY.set(((event.clientY - bounds.top) / bounds.height - .5) * 2);
  }

  resetHero(): void { this.heroX.set(0); this.heroY.set(0); }

  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}
