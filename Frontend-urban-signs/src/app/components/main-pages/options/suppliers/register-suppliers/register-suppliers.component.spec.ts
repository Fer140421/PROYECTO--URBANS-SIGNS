import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSuppliersComponent } from './register-suppliers.component';

describe('RegisterSuppliersComponent', () => {
  let component: RegisterSuppliersComponent;
  let fixture: ComponentFixture<RegisterSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSuppliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
