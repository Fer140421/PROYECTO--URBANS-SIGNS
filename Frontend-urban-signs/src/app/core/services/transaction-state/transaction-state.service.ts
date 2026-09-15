import { Injectable, computed, signal } from '@angular/core';

export type TransactionId = number;

@Injectable({
  providedIn: 'root'
})
export class TransactionStateService {
  private readonly defaultMessage = 'Procesando operación...';
  private readonly activeTransactions = signal<ReadonlyMap<TransactionId, string>>(new Map());
  private nextTransactionId = 0;

  readonly pendingCount = computed(() => this.activeTransactions().size);
  readonly isProcessing = computed(() => this.pendingCount() > 0);
  readonly message = computed(() => {
    const messages = Array.from(this.activeTransactions().values());
    return messages.at(-1) ?? this.defaultMessage;
  });

  begin(message: string = this.defaultMessage): TransactionId {
    const transactionId = ++this.nextTransactionId;
    const transactions = new Map(this.activeTransactions());
    transactions.set(transactionId, message.trim() || this.defaultMessage);
    this.activeTransactions.set(transactions);
    return transactionId;
  }

  end(transactionId: TransactionId): void {
    if (!this.activeTransactions().has(transactionId)) {
      return;
    }

    const transactions = new Map(this.activeTransactions());
    transactions.delete(transactionId);
    this.activeTransactions.set(transactions);
  }
}
