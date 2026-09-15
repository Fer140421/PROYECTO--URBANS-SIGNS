import { TestBed } from '@angular/core/testing';

import { LoteServiceService } from './lote-service.service';

describe('LoteServiceService', () => {
  let service: LoteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
