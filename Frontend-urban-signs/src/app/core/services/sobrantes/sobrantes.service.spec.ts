import { TestBed } from '@angular/core/testing';

import { SobrantesService } from './sobrantes.service';

describe('SobrantesService', () => {
  let service: SobrantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SobrantesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
