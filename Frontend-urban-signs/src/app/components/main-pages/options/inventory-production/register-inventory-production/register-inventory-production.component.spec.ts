import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInventoryProductionComponent } from './register-inventory-production.component';

describe('RegisterInventoryProductionComponent', () => {
  let component: RegisterInventoryProductionComponent;
  let fixture: ComponentFixture<RegisterInventoryProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterInventoryProductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterInventoryProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
