import { HttpContextToken, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionStateService } from '../services/transaction-state/transaction-state.service';

export const SKIP_GLOBAL_TRANSACTION = new HttpContextToken<boolean>(() => false);
export const TRANSACTION_MESSAGE = new HttpContextToken<string | null>(() => null);

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const EXCLUDED_ENDPOINTS = ['/v1/user/login', '/users/refresh'];

function isOwnApiRequest(url: string): boolean {
  const apiBaseUrl = environment.API_URL.replace(/\/$/, '');
  return url === apiBaseUrl || url.startsWith(`${apiBaseUrl}/`);
}

function isExcludedEndpoint(url: string): boolean {
  return EXCLUDED_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function shouldTrack(request: HttpRequest<unknown>): boolean {
  return MUTATION_METHODS.has(request.method.toUpperCase())
    && isOwnApiRequest(request.url)
    && !isExcludedEndpoint(request.url)
    && !request.context.get(SKIP_GLOBAL_TRANSACTION);
}

function getDefaultMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'Registrando información...';
    case 'PUT':
      return 'Guardando cambios...';
    case 'PATCH':
      return 'Actualizando información...';
    case 'DELETE':
      return 'Eliminando registro...';
    default:
      return 'Procesando operación...';
  }
}

export function transactionInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (!shouldTrack(request)) {
    return next(request);
  }

  const transactionState = inject(TransactionStateService);
  const message = request.context.get(TRANSACTION_MESSAGE) ?? getDefaultMessage(request.method);

  return defer(() => {
    const transactionId = transactionState.begin(message);
    return next(request).pipe(
      finalize(() => transactionState.end(transactionId))
    );
  });
}
