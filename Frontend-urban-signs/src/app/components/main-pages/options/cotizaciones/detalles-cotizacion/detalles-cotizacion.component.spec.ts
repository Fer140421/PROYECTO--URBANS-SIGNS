import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesCotizacionComponent } from './detalles-cotizacion.component';

describe('DetallesCotizacionComponent', () => {
  let component: DetallesCotizacionComponent;
  let fixture: ComponentFixture<DetallesCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesCotizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
