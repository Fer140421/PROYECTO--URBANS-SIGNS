import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiracionComponent } from './expiracion.component';

describe('ExpiracionComponent', () => {
  let component: ExpiracionComponent;
  let fixture: ComponentFixture<ExpiracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
