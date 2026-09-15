import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmisionOrdenImpresionComponent } from './emision-orden-impresion.component';

describe('EmisionOrdenImpresionComponent', () => {
  let component: EmisionOrdenImpresionComponent;
  let fixture: ComponentFixture<EmisionOrdenImpresionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmisionOrdenImpresionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmisionOrdenImpresionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
