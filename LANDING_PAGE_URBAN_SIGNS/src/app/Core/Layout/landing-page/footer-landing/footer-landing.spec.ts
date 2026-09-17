import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterLanding } from './footer-landing';

describe('FooterLanding', () => {
  let component: FooterLanding;
  let fixture: ComponentFixture<FooterLanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterLanding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterLanding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
