import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface Notification {
  message: string;
  date: Date;
  read: boolean;
}
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {
  @Output() close = new EventEmitter<void>();
  isModalOpen = true;

  notifications: Notification[] = [
    { message: 'Nuevo pedido recibido 🧾', date: new Date(), read: false },
    { message: 'Diseño aprobado 🎨', date: new Date(), read: false },
    { message: 'Cronograma actualizado 📅', date: new Date(), read: false }
  ];

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  closeModal(): void {
    this.close.emit();
    this.isModalOpen = false;
  }
}
