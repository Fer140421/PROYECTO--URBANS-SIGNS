import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletarPedidoComponent } from './completar-pedido.component';

describe('CompletarPedidoComponent', () => {
  let component: CompletarPedidoComponent;
  let fixture: ComponentFixture<CompletarPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletarPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletarPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
