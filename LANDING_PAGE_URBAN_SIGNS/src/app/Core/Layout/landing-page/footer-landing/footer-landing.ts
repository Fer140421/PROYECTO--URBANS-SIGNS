import { Component } from '@angular/core';
import { ScrollRevealDirectiveDirective } from '../../../directives/scroll-reveal-directive.directive';

@Component({
  selector: 'app-footer-landing',
  imports: [ScrollRevealDirectiveDirective],
  templateUrl: './footer-landing.html',
  styleUrl: './footer-landing.css',
})
export class FooterLanding {
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
