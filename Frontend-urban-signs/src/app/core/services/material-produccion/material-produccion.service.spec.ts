import { TestBed } from '@angular/core/testing';

import { MaterialProduccionService } from './material-produccion.service';

describe('MaterialProduccionService', () => {
  let service: MaterialProduccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialProduccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
