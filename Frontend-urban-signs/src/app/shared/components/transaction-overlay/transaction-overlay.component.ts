import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TransactionStateService } from '../../../core/services/transaction-state/transaction-state.service';

@Component({
  selector: 'app-transaction-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-overlay.component.html',
  styleUrl: './transaction-overlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionOverlayComponent {
  readonly transactionState = inject(TransactionStateService);
}
