import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { catchError, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const verifyGuard: CanActivateFn = (_route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  // La cookie del backend es la fuente de verdad. Si el access token venció,
  // esta petición activa el refresh automático en el interceptor.
  return authService.getCurrentUserInfo().pipe(
    map(response => {
      if (response?.username || response?.usuario) {
        return true;
      }

      authService.clearCurrentUser();
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }),
    catchError(() => {
      authService.clearCurrentUser();
      return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    })
  );
};
