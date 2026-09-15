import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TransactionStateService } from '../services/transaction-state/transaction-state.service';
import {
  SKIP_GLOBAL_TRANSACTION,
  TRANSACTION_MESSAGE,
  transactionInterceptor
} from './transaction.interceptor';

describe('transactionInterceptor', () => {
  let httpTesting: HttpTestingController;
  let transactionState: TransactionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([transactionInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpTesting = TestBed.inject(HttpTestingController);
    transactionState = TestBed.inject(TransactionStateService);
  });

  afterEach(() => httpTesting.verify());

  it('should track an API mutation until it completes', () => {
    const http = TestBed.inject(HttpClient);

    http.post(`${environment.API_URL}/trabajos/registrar`, {}).subscribe();

    expect(transactionState.isProcessing()).toBeTrue();
    expect(transactionState.message()).toBe('Registrando información...');

    httpTesting.expectOne(`${environment.API_URL}/trabajos/registrar`).flush({});

    expect(transactionState.isProcessing()).toBeFalse();
  });

  it('should release the transaction after an HTTP error', () => {
    const http = TestBed.inject(HttpClient);

    http.put(`${environment.API_URL}/trabajos/modificar/1`, {}).subscribe({ error: () => undefined });
    httpTesting.expectOne(`${environment.API_URL}/trabajos/modificar/1`).flush(
      { message: 'Error' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(transactionState.isProcessing()).toBeFalse();
  });

  it('should support a custom transaction message', () => {
    const http = TestBed.inject(HttpClient);
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando servicio...');

    http.patch(`${environment.API_URL}/trabajos/eliminar/1`, {}, { context }).subscribe();

    expect(transactionState.message()).toBe('Eliminando servicio...');
    httpTesting.expectOne(`${environment.API_URL}/trabajos/eliminar/1`).flush({});
  });

  it('should allow explicitly skipping global tracking', () => {
    const http = TestBed.inject(HttpClient);
    const context = new HttpContext().set(SKIP_GLOBAL_TRANSACTION, true);

    http.post(`${environment.API_URL}/internal-task`, {}, { context }).subscribe();

    expect(transactionState.isProcessing()).toBeFalse();
    httpTesting.expectOne(`${environment.API_URL}/internal-task`).flush({});
  });

  it('should not track reads, external requests or excluded authentication endpoints', () => {
    const http = TestBed.inject(HttpClient);

    http.get(`${environment.API_URL}/trabajos/listar`).subscribe();
    http.post('https://example.com/external', {}).subscribe();
    http.post(`${environment.API_URL}/v1/user/login`, {}).subscribe();

    expect(transactionState.isProcessing()).toBeFalse();

    httpTesting.expectOne(`${environment.API_URL}/trabajos/listar`).flush({});
    httpTesting.expectOne('https://example.com/external').flush({});
    httpTesting.expectOne(`${environment.API_URL}/v1/user/login`).flush({});
  });
});
