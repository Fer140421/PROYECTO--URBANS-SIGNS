import { TestBed } from '@angular/core/testing';
import { TransactionStateService } from './transaction-state.service';

describe('TransactionStateService', () => {
  let service: TransactionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionStateService);
  });

  it('should start without active transactions', () => {
    expect(service.isProcessing()).toBeFalse();
    expect(service.pendingCount()).toBe(0);
    expect(service.message()).toBe('Procesando operación...');
  });

  it('should expose the latest transaction message', () => {
    service.begin('Registrando servicio...');

    expect(service.isProcessing()).toBeTrue();
    expect(service.pendingCount()).toBe(1);
    expect(service.message()).toBe('Registrando servicio...');
  });

  it('should remain active until every concurrent transaction ends', () => {
    const firstId = service.begin('Guardando cambios...');
    const secondId = service.begin('Eliminando registro...');

    service.end(firstId);

    expect(service.isProcessing()).toBeTrue();
    expect(service.pendingCount()).toBe(1);
    expect(service.message()).toBe('Eliminando registro...');

    service.end(secondId);

    expect(service.isProcessing()).toBeFalse();
    expect(service.pendingCount()).toBe(0);
  });

  it('should ignore an unknown or already completed transaction', () => {
    const transactionId = service.begin();

    service.end(transactionId);
    service.end(transactionId);
    service.end(9999);

    expect(service.pendingCount()).toBe(0);
    expect(service.isProcessing()).toBeFalse();
  });
});
