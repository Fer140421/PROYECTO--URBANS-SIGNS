import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarOrdenImpresionComponent } from './modificar-orden-impresion.component';

describe('ModificarOrdenImpresionComponent', () => {
  let component: ModificarOrdenImpresionComponent;
  let fixture: ComponentFixture<ModificarOrdenImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarOrdenImpresionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarOrdenImpresionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
