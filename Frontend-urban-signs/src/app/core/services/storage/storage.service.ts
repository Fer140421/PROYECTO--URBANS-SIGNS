import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isLoggedInSubject: BehaviorSubject<boolean>;

  constructor() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!token);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  //obtener token
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      this.isLoggedInSubject.next(true);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      this.isLoggedInSubject.next(false);
    }
  }
  // Guardar ID de usuario
  setUserId(id: number): void {
    localStorage.setItem('user_id', id.toString());
  }

  // Obtener ID de usuario
  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  //obtener rol
  setRoles(roles: string[]): void {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getRoles(): string[] {
    if (typeof localStorage === 'undefined') return [];
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    //localStorage.removeItem('roles');
    //localStorage.removeItem('user_id')
    //ocalStorage.removeItem('empl_id');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

}
