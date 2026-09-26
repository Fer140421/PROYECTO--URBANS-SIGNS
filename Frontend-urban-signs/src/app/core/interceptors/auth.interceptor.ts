import {
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, map, switchMap, take, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginService } from '../services/login/login.service';

const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);
const REFRESH_ENDPOINT = '/users/refresh';
const EXCLUDED_ENDPOINTS = ['/v1/user/login', REFRESH_ENDPOINT, '/users/logout'];

let isRefreshing = false;
const refreshState$ = new BehaviorSubject<boolean | null>(null);

interface RefreshResponse {
  success: boolean;
}

function isOwnApiRequest(url: string): boolean {
  const apiBaseUrl = environment.API_URL.replace(/\/$/, '');
  return url === apiBaseUrl || url.startsWith(`${apiBaseUrl}/`);
}

function isRefreshExcluded(url: string): boolean {
  return EXCLUDED_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function clearSessionAndRedirect(error: unknown, loginService: LoginService, router: Router) {
  isRefreshing = false;
  loginService.clearCurrentUser();
  void router.navigate(['/login']);
  return throwError(() => error);
}

function retryRequest(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(request.clone({
    withCredentials: true,
    context: request.context.set(RETRIED_AFTER_REFRESH, true)
  }));
}

function retryAfterRefresh(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  loginService: LoginService,
  router: Router
) {
  return retryRequest(request, next).pipe(
    catchError(retryError => {
      if (retryError instanceof HttpErrorResponse && (retryError.status === 401 || retryError.status === 403)) {
        return clearSessionAndRedirect(retryError, loginService, router);
      }

      return throwError(() => retryError);
    })
  );
}

/**
 * Cookie-based authentication interceptor. Access and refresh tokens remain in
 * HttpOnly cookies and a request is retried at most once after refresh.
 */
export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const loginService = inject(LoginService);
  const isOwnApi = isOwnApiRequest(request.url);
  const requestWithCredentials = isOwnApi ? request.clone({ withCredentials: true }) : request;

  return next(requestWithCredentials).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        !isOwnApi ||
        error.status !== 401 ||
        isRefreshExcluded(request.url) ||
        request.context.get(RETRIED_AFTER_REFRESH)
      ) {
        if (isOwnApi && error.status === 401 && request.context.get(RETRIED_AFTER_REFRESH)) {
          return clearSessionAndRedirect(error, loginService, router);
        }

        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshState$.pipe(
          filter((refreshSucceeded): refreshSucceeded is boolean => refreshSucceeded !== null),
          take(1),
          timeout(8000),
          switchMap(refreshSucceeded => refreshSucceeded
            ? retryAfterRefresh(request, next, loginService, router)
            : clearSessionAndRedirect(error, loginService, router)
          ),
          catchError(waitError => {
            isRefreshing = false;
            return clearSessionAndRedirect(waitError, loginService, router);
          })
        );
      }

      isRefreshing = true;
      refreshState$.next(null);

      // `next` intentionally bypasses this interceptor for the refresh request,
      // avoiding a recursive refresh cycle while keeping credentials enabled.
      const refreshRequest = new HttpRequest('POST', `${environment.API_URL}${REFRESH_ENDPOINT}`, {}, {
        withCredentials: true
      });

      return next(refreshRequest).pipe(
        timeout(10000),
        filter((event): event is HttpResponse<RefreshResponse> => event instanceof HttpResponse),
        take(1),
        map(response => {
          if (!response.body?.success) {
            throw new Error('La renovación de sesión no fue aceptada.');
          }
          return response;
        }),
        catchError(refreshError => {
          isRefreshing = false;
          refreshState$.next(false);
          return clearSessionAndRedirect(refreshError, loginService, router);
        }),
        switchMap(() => {
          isRefreshing = false;
          refreshState$.next(true);
          return retryAfterRefresh(request, next, loginService, router);
        }),
        finalize(() => {
          if (isRefreshing) {
            isRefreshing = false;
          }
        })
      );
    })
  );
}
