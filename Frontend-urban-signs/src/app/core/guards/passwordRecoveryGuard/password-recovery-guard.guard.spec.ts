import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { passwordRecoveryGuardGuard } from './password-recovery-guard.guard';

describe('passwordRecoveryGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => passwordRecoveryGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
