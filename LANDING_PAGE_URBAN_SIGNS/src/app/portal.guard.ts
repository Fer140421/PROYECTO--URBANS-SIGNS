import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { PortalAuthService } from './Core/portal-auth.service';

export const portalGuard: CanActivateFn = () => {
  const auth = inject(PortalAuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return auth.restoreSession().pipe(
    map(isAuthenticated => isAuthenticated ? true : router.createUrlTree(['/login']))
  );
};
