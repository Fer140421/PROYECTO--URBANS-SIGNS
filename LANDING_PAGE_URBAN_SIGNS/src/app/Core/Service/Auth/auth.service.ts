import { Injectable, computed, signal } from '@angular/core';
import { ClientUser } from '../../Models/client-portal.model';

/**
 * Servicio temporal para los flujos públicos que todavía no tienen endpoints.
 * No representa una sesión ni persiste datos: el acceso al portal usa
 * exclusivamente PortalAuthService y la cookie HTTP del backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<ClientUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  register(data: Partial<ClientUser>): ClientUser {
    const name = data.name?.trim() || 'Nuevo cliente';
    const user: ClientUser = {
      id: `pending-${Date.now()}`,
      name,
      email: data.email?.trim() || '',
      company: data.company?.trim() || 'Cliente particular',
      phone: data.phone?.trim() || '',
      initials: this.getInitials(name)
    };

    this.currentUser.set(user);
    return user;
  }

  updateProfile(data: Partial<ClientUser>): void {
    const current = this.currentUser();
    if (!current) return;

    const updated = { ...current, ...data, initials: this.getInitials(data.name ?? current.name) };
    this.currentUser.set(updated);
  }

  logout(): void {
    this.currentUser.set(null);
  }

  private getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }
}
