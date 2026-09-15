import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudEmailComponent } from './solicitud-email.component';

describe('SolicitudEmailComponent', () => {
  let component: SolicitudEmailComponent;
  let fixture: ComponentFixture<SolicitudEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
