import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionOrdenImpresionComponent } from './recepcion-orden-impresion.component';

describe('RecepcionOrdenImpresionComponent', () => {
  let component: RecepcionOrdenImpresionComponent;
  let fixture: ComponentFixture<RecepcionOrdenImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionOrdenImpresionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionOrdenImpresionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
