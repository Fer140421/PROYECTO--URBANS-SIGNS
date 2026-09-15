import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { isPlatformBrowser } from '@angular/common';
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  console.log('🔵 noAuthGuard ejecutado para:', state.url);
  if (!isPlatformBrowser(platformId)) {
    console.log('⚠️ SSR detectado - permitiendo acceso');
    return true;
  }

  // ✅ Verificar estado local
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.currentUser();

  if (isAuth && currentUser && currentUser.username) {
    console.log('✅ Usuario ya autenticado localmente:', currentUser.username, '→ Redirigiendo a home');
    return router.createUrlTree(['/home']);
  }

  console.log('✅ No autenticado localmente → Permitiendo acceso a login (sin verificar backend)');
  authService.clearCurrentUser();
  return true;
};
