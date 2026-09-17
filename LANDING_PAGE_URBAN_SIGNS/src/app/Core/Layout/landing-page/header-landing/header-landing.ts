import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { PortalAuthService } from '../../../portal-auth.service';

@Component({
  selector: 'app-header-landing',
  imports: [CommonModule, RouterLink],
  templateUrl: './header-landing.html',
  styleUrl: './header-landing.css',
})
export class HeaderLanding {
  private readonly auth = inject(PortalAuthService);
  readonly currentUser = this.auth.currentUser;
 isMobileMenuOpen = false;
  isUserMenuOpen = false;

  constructor(private readonly router: Router) {}

  menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'nosotros', label: 'Experiencia' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'whatsapp', label: 'Contacto' },
    { id: 'portafolio', label: 'Portafolio' }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  logout() {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.auth.logout().subscribe(() => this.router.navigate(['/landing/home']));
  }

  scrollTo(section: string) {
    if (section === 'inicio') {
      this.router.navigate(['/landing/home']);
      this.closeMobileMenu();
      return;
    }
    if (section === 'portafolio') {
      this.router.navigate(['/landing/portafolio']);
      this.closeMobileMenu();
      return;
    }
    const scroll = () => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    if (document.getElementById(section)) {
      scroll();
    } else {
      this.router.navigate(['/landing/home'], { fragment: section });
    }
    this.closeMobileMenu();
  }
}
