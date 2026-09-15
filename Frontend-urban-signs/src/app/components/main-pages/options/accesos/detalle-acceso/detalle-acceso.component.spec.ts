import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAccesoComponent } from './detalle-acceso.component';

describe('DetalleAccesoComponent', () => {
  let component: DetalleAccesoComponent;
  let fixture: ComponentFixture<DetalleAccesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAccesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleAccesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
