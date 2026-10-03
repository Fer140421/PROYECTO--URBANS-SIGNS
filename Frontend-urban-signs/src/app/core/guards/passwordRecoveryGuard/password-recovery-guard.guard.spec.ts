import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { passwordRecoveryGuard } from './password-recovery-guard.guard';

describe('passwordRecoveryGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => passwordRecoveryGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
