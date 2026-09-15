import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppNotification, NotificationService } from '../../../core/services/notification/notification.service';


@Component({
  selector: 'app-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacion.component.html',
  styleUrl: './notificacion.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: AppNotification[] = [];
  notificationService = inject(NotificationService);

  ngOnInit() {
    this.notificationService.notifications$.subscribe((notification) => {
      this.notifications.push(notification);

      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          this.removeNotification(notification);
        }, notification.duration);
      }
    });
  }

  removeNotification(notification: AppNotification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      // Encuentra el elemento específico de la notificación
      const notificationElements = document.querySelectorAll('.notification');
      const notifEl = notificationElements[index] as HTMLElement;

      if (notifEl) {
        notifEl.classList.add('hide');
        setTimeout(() => {
          this.notifications = this.notifications.filter(n => n !== notification);
        }, 400); // esperar animación
      } else {
        this.notifications = this.notifications.filter(n => n !== notification);
      }
    }
  }
}
