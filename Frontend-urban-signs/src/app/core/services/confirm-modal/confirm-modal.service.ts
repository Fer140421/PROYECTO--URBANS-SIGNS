import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  showCancel?: boolean;
}

export interface DialogState {
  isOpen: boolean;
  options: ConfirmModalOptions;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  private dialogStateSubject = new Subject<DialogState>();
  public dialogState$ = this.dialogStateSubject.asObservable();

  confirm(optionsOrMessage: ConfirmModalOptions | string, title?: string, type?: DialogType): Promise<boolean> {
    const isString = typeof optionsOrMessage === 'string';
    const message = isString ? optionsOrMessage : optionsOrMessage.message;
    const isEliminar = message.toLowerCase().includes('eliminar') || message.toLowerCase().includes('anular');

    const options: ConfirmModalOptions = isString
      ? {
          message,
          title: title || (isEliminar ? 'Confirmar eliminación' : 'Confirmar acción'),
          type: type || (isEliminar ? 'danger' : 'warning'),
          confirmText: isEliminar ? 'Eliminar' : 'Confirmar',
          cancelText: 'Cancelar',
          showCancel: true
        }
      : {
          showCancel: true,
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          type: optionsOrMessage.type || (isEliminar ? 'danger' : 'warning'),
          ...optionsOrMessage
        };

    return new Promise<boolean>((resolve) => {
      this.dialogStateSubject.next({
        isOpen: true,
        options,
        resolve
      });
    });
  }

  alert(optionsOrMessage: ConfirmModalOptions | string, title?: string, type: DialogType = 'info'): Promise<void> {
    const isString = typeof optionsOrMessage === 'string';
    const message = isString ? optionsOrMessage : optionsOrMessage.message;

    const options: ConfirmModalOptions = isString
      ? {
          message,
          title: title || (type === 'danger' ? 'Atención' : 'Información'),
          type,
          confirmText: 'Entendido',
          showCancel: false
        }
      : {
          showCancel: false,
          confirmText: 'Entendido',
          type: 'info',
          ...optionsOrMessage
        };

    return new Promise<void>((resolve) => {
      this.dialogStateSubject.next({
        isOpen: true,
        options,
        resolve: () => resolve()
      });
    });
  }
}
