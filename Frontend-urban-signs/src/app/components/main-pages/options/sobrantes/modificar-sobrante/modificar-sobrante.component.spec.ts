import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarSobranteComponent } from './modificar-sobrante.component';

describe('ModificarSobranteComponent', () => {
  let component: ModificarSobranteComponent;
  let fixture: ComponentFixture<ModificarSobranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarSobranteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarSobranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
