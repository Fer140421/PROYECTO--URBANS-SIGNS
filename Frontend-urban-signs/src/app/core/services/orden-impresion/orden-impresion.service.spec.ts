import { TestBed } from '@angular/core/testing';

import { OrdenImpresionService } from './orden-impresion.service';

describe('OrdenImpresionService', () => {
  let service: OrdenImpresionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenImpresionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
