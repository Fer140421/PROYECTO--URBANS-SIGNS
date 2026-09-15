import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInventoryProductionComponent } from './list-inventory-production.component';

describe('ListInventoryProductionComponent', () => {
  let component: ListInventoryProductionComponent;
  let fixture: ComponentFixture<ListInventoryProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListInventoryProductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListInventoryProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
