import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarCotizacionComponent } from './aprobar-cotizacion.component';

describe('AprobarCotizacionComponent', () => {
  let component: AprobarCotizacionComponent;
  let fixture: ComponentFixture<AprobarCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprobarCotizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobarCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
