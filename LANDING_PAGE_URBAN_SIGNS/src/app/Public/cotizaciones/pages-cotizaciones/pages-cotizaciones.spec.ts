import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PagesCotizaciones } from './pages-cotizaciones';

describe('PagesCotizaciones', () => {
  let component: PagesCotizaciones;
  let fixture: ComponentFixture<PagesCotizaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesCotizaciones],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesCotizaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/portal/me'))
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the sign-in invitation to a guest', () => {
    expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
