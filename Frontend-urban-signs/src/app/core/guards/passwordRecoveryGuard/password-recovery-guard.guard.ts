import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { isPlatformBrowser } from '@angular/common';

export const passwordRecoveryGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UsersService);
  const platformId = inject(PLATFORM_ID);

  // Si estamos en el servidor (SSR), permitir acceso temporalmente
  // La validación real se hará en el cliente
  if (!isPlatformBrowser(platformId)) {
    console.log('⚠️ Guard ejecutándose en servidor (SSR) - permitiendo acceso temporal');
    return true;
  }

  const currentPath = state.url;

  // Obtener el email almacenado (indica que pasó por solicitud-email)
  const email = userService.getEmail();

  // Proteger ruta de verificación
  if (currentPath.includes('/verification')) {
    if (!email) {
      console.log('❌ Acceso denegado a /verification - No hay email registrado');
      router.navigate(['/solicitud-email']);
      return false;
    }
    console.log('✅ Acceso permitido a /verification');
    return true;
  }

  // Proteger ruta de nueva contraseña
  if (currentPath.includes('/new-contrasenia')) {
    if (!email) {
      console.log('❌ Acceso denegado a /new-contrasenia - No hay email registrado');
      router.navigate(['/solicitud-email']);
      return false;
    }

    // Verificar que el código fue validado
    const codeVerified = userService.isCodeVerified();
    if (!codeVerified) {
      console.log('❌ Acceso denegado a /new-contrasenia - Código no verificado');
      router.navigate(['/verification']);
      return false;
    }

    console.log('✅ Acceso permitido a /new-contrasenia');
    return true;
  }

  return true;
};