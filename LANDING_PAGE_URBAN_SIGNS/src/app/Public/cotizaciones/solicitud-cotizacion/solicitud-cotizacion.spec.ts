import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudCotizacion } from './solicitud-cotizacion';

describe('SolicitudCotizacion', () => {
  let component: SolicitudCotizacion;
  let fixture: ComponentFixture<SolicitudCotizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudCotizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudCotizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
