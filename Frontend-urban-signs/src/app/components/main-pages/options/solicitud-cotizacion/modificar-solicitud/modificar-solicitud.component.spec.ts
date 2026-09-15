import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarSolicitudComponent } from './modificar-solicitud.component';

describe('ModificarSolicitudComponent', () => {
  let component: ModificarSolicitudComponent;
  let fixture: ComponentFixture<ModificarSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarSolicitudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
