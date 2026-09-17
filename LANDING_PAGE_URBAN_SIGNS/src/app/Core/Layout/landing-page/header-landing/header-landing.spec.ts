import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { HeaderLanding } from './header-landing';

describe('HeaderLanding', () => {
  let component: HeaderLanding;
  let fixture: ComponentFixture<HeaderLanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLanding],
      providers: [provideRouter([]), provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderLanding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides the public quotation link in the mobile menu and closes it on click', () => {
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.toggleMobileMenu();
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('nav.flex-1 a[href="/landing/cotizaciones"]');
    expect(link).toBeTruthy();
    link.click();
    expect(component.isMobileMenuOpen).toBeFalse();
  });
});
