import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarCotizacionComponent } from './modificar-cotizacion.component';

describe('ModificarCotizacionComponent', () => {
  let component: ModificarCotizacionComponent;
  let fixture: ComponentFixture<ModificarCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarCotizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
