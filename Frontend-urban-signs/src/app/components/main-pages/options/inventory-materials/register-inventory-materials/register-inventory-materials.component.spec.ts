import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInventoryMaterialsComponent } from './register-inventory-materials.component';

describe('RegisterInventoryMaterialsComponent', () => {
  let component: RegisterInventoryMaterialsComponent;
  let fixture: ComponentFixture<RegisterInventoryMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterInventoryMaterialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterInventoryMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
