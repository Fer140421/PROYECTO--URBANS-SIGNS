import { TestBed } from '@angular/core/testing';

import { ConfirmarCotizacionService } from './confirmar-cotizacion.service';

describe('ConfirmarCotizacionService', () => {
  let service: ConfirmarCotizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmarCotizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
