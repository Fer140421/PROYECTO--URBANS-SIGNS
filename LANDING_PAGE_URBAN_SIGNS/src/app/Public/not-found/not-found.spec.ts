import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { NotFound } from './not-found';

describe('Unknown routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  for (const url of ['/no-existe', '/landing/no-existe', '/portal/no-existe']) {
    it(`shows the 404 page for ${url}`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url, NotFound);
      expect(TestBed.inject(Router).url).toBe(url);
      expect(harness.routeNativeElement?.textContent).toContain('Página no encontrada');
      expect(harness.routeNativeElement?.querySelector('a[href="/landing/home"]')).toBeTruthy();
    });
  }
});
