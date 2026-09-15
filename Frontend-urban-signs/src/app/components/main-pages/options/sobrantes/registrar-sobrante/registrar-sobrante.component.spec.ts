import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarSobranteComponent } from './registrar-sobrante.component';

describe('RegistrarSobranteComponent', () => {
  let component: RegistrarSobranteComponent;
  let fixture: ComponentFixture<RegistrarSobranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarSobranteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarSobranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
