import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFacturacionesComponent } from './list-facturaciones.component';

describe('ListFacturacionesComponent', () => {
  let component: ListFacturacionesComponent;
  let fixture: ComponentFixture<ListFacturacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFacturacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFacturacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
