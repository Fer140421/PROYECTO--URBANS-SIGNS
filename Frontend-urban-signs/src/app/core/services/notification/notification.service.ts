import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  message: string;
  type: NotificationType;
  duration?: number;
}


@Injectable({
  providedIn: 'root'
})

export class NotificationService {

   private notificationSubject = new Subject<AppNotification>();

  get notifications$(): Observable<AppNotification> {
    return this.notificationSubject.asObservable();
  }

  show(message: string, type: NotificationType = 'info', duration: number = 5000) {
    this.notificationSubject.next({ message, type, duration });
  }

  success(msg: string, duration?: number) {
    this.show(msg, 'success', duration);
  }

  error(msg: string, duration?: number) {
    this.show(msg, 'error', duration);
  }

  warning(msg: string, duration?: number) {
    this.show(msg, 'warning', duration);
  }

  info(msg: string, duration?: number) {
    this.show(msg, 'info', duration);
  }
}
