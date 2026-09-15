import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleLoteComponent } from './detalle-lote.component';

describe('DetalleLoteComponent', () => {
  let component: DetalleLoteComponent;
  let fixture: ComponentFixture<DetalleLoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleLoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleLoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
