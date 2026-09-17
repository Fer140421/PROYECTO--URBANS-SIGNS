import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { PortalAuthService } from '../portal-auth.service';

let refreshInFlight$: Observable<void> | null = null;

const excludedPaths = ['/v1/user/login', '/users/refresh', '/users/logout'];

export const portalSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(PortalAuthService);
  const router = inject(Router);
  const sessionVersion = auth.sessionVersion;
  const isExcluded = excludedPaths.some(path => request.url.includes(path));
  const isProtectedRoute = request.url.includes('/portal/');

  if (isExcluded || !isProtectedRoute) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || sessionVersion !== auth.sessionVersion) {
        return throwError(() => error);
      }

      if (!refreshInFlight$) {
        refreshInFlight$ = auth.refreshSession().pipe(
          finalize(() => refreshInFlight$ = null),
          shareReplay({ bufferSize: 1, refCount: false })
        );
      }

      return refreshInFlight$.pipe(
        switchMap(() => sessionVersion === auth.sessionVersion ? next(request) : throwError(() => error)),
        catchError(refreshError => {
          if (sessionVersion === auth.sessionVersion) {
            auth.clearSession();
            if (/^\/portal(?:\/|\?|$)/.test(router.url)) {
              router.navigate(['/login']);
            }
          }
          return throwError(() => refreshError);
        })
      );
    })
  );
};
