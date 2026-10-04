import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmModalService, DialogState } from '../../../core/services/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  private confirmService = inject(ConfirmModalService);
  private sub?: Subscription;

  state: DialogState = {
    isOpen: false,
    options: { message: '' }
  };

  ngOnInit(): void {
    this.sub = this.confirmService.dialogState$.subscribe((state) => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onConfirm(): void {
    if (this.state.resolve) {
      this.state.resolve(true);
    }
    this.close();
  }

  onCancel(): void {
    if (this.state.resolve) {
      this.state.resolve(false);
    }
    this.close();
  }

  private close(): void {
    this.state = {
      isOpen: false,
      options: { message: '' }
    };
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.state.isOpen) {
      this.onCancel();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    if (this.state.isOpen) {
      const activeEl = document.activeElement;
      if (activeEl?.getAttribute('data-action') === 'cancel') {
        return;
      }
      event.preventDefault();
      this.onConfirm();
    }
  }
}
