import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { transactionInterceptor } from './core/interceptors/transaction.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';


registerLocaleData(localeEsBo, 'es-BO');
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([transactionInterceptor, authInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'es-BO' },

  ]
};
