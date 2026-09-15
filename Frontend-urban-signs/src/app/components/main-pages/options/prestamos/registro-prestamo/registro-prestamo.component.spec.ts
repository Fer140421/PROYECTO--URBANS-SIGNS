import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPrestamoComponent } from './registro-prestamo.component';

describe('RegistroPrestamoComponent', () => {
  let component: RegistroPrestamoComponent;
  let fixture: ComponentFixture<RegistroPrestamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPrestamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPrestamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
