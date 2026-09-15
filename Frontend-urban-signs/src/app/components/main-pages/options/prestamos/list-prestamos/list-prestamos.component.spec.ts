import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPrestamosComponent } from './list-prestamos.component';

describe('ListPrestamosComponent', () => {
  let component: ListPrestamosComponent;
  let fixture: ComponentFixture<ListPrestamosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPrestamosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPrestamosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
