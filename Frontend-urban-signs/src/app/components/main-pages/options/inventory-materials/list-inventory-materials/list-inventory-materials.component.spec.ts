import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInventoryMaterialsComponent } from './list-inventory-materials.component';

describe('ListInventoryMaterialsComponent', () => {
  let component: ListInventoryMaterialsComponent;
  let fixture: ComponentFixture<ListInventoryMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListInventoryMaterialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListInventoryMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
