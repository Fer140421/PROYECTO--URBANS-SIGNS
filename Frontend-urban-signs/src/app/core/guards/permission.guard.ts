import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

export const permissionGuard: CanActivateFn = route => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const permissions = (route.data?.['permissions'] as string[] | undefined) ?? [];
  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const hasRequiredPermission = permissions.length === 0 || loginService.hasAnyPermission(...permissions);
  const hasRequiredRole = roles.length === 0 || loginService.hasAnyRole(roles);

  return hasRequiredPermission && hasRequiredRole
    ? true
    : router.createUrlTree(['/home']);
};
