import { TestBed } from '@angular/core/testing';

import { UsuariosRolesService } from './usuarios-roles.service';

describe('UsuariosRolesService', () => {
  let service: UsuariosRolesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuariosRolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
