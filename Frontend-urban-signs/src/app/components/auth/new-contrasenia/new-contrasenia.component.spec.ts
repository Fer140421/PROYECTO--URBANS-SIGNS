import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContraseniaComponent } from './new-contrasenia.component';

describe('NewContraseniaComponent', () => {
  let component: NewContraseniaComponent;
  let fixture: ComponentFixture<NewContraseniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewContraseniaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewContraseniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
