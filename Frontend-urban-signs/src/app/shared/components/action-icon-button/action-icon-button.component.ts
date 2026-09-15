import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TransactionStateService } from '../../../core/services/transaction-state/transaction-state.service';

export type ActionButtonVariant = 'neutral' | 'primary' | 'warning' | 'danger' | 'success';

@Component({
  selector: 'app-action-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-icon-button.component.html',
  styleUrl: './action-icon-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionIconButtonComponent {
  readonly transactionState = inject(TransactionStateService);

  @Input({ required: true }) label = '';
  @Input({ required: true }) icon = '';
  @Input() variant: ActionButtonVariant = 'neutral';
  @Input() disabled = false;
  @Output() readonly action = new EventEmitter<MouseEvent>();
}
