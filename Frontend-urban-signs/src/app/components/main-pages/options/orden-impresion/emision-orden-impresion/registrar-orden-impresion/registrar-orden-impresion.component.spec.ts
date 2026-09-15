import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarOrdenImpresionComponent } from './registrar-orden-impresion.component';

describe('RegistrarOrdenImpresionComponent', () => {
  let component: RegistrarOrdenImpresionComponent;
  let fixture: ComponentFixture<RegistrarOrdenImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarOrdenImpresionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarOrdenImpresionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
