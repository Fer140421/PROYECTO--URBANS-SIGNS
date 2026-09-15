import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../core/services/storage/storage.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../core/services/login/login.service';
import { NotificacionesComponent } from "../../shared/notificaciones/notificaciones/notificaciones.component";
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { Theme, ThemeService } from '../../core/services/theme/theme.service';

@Component({
  selector: 'app-main-pages',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificacionesComponent, HasRoleDirective, HasPermissionDirective],
  templateUrl: './main-pages.component.html',
  styleUrl: './main-pages.component.css'
})
export class MainPagesComponent {

  storageService = inject(StorageService);
  loginService = inject(LoginService);
  router = inject(Router);
  themeService = inject(ThemeService);
  notificationState = '';
  menuAbierto = false;
  submenuAbierto: { [key: string]: boolean } = {};
  notificationPulse = false;
  sidebarCollapsed = false;
  sidebarMobileOpen = false;

  logout() {
    this.loginService.logout().subscribe();
  }

  canAccessPersonal(): boolean {
    return this.loginService.hasRole('Gerente') || this.loginService.hasPermission('EMPLEADO_VER');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  openSidebarOnMobile(): void {
    this.sidebarMobileOpen = true;
  }

  closeSidebar(): void {
    this.sidebarMobileOpen = false;
  }

  closeSidebarOnMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.closeSidebar();
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // evita que se cierre si clickeas dentro del menú
    if (!target.closest('.relative')) {
      this.menuAbierto = false;
    }
  }

  toggleSubmenu(menu: string) {
    // Alterna el submenú, y cierra los otros si quieres
    this.submenuAbierto[menu] = !this.submenuAbierto[menu];
  }

  closeMenu(): void {
    this.menuAbierto = false;
  }

  showNotifications = false;

  onNotificationClick() {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }


}
