import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { ScrollService } from '../../../core/services/ScrollService/scroll.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  menuItems = [
    { label: 'Inicio', section: 'hero' },
    { label: 'Nosotros', section: 'about' },
    { label: 'Servicios', section: 'services' },
    { label: 'Portafolio', section: 'portfolio' },
    { label: 'Contacto', section: 'contact' }
  ];

  constructor(private scrollService: ScrollService) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  scrollToSection(section: string) {
    this.scrollService.scrollToSection(section);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }
}
