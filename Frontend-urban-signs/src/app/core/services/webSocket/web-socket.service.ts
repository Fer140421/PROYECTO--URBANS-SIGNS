import { Injectable, signal } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { environment } from '../../../../environments/environment'
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  type: 'MESSAGE' | 'JOIN' | 'LEAVE' | 'PRIVATE' | 'NOTIFICATION';
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  // Signals de Angular 18
  isConnected = signal<boolean>(false);
  connectionError = signal<string | null>(null);

  // Observables para mensajes
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<ChatMessage | null>(null);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Conectar al WebSocket con autenticación JWT (cookie)
   */
  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Crear cliente STOMP
      this.stompClient = new Client({
        webSocketFactory: () => {
          // ✅ SockJS con withCredentials para enviar cookies
          return new SockJS(`${environment.API_URL}/ws`, null, {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling']
          }) as any;
        },
        
        // Callbacks
        onConnect: (frame) => {
          console.log('✅ WebSocket conectado:', frame);
          this.isConnected.set(true);
          this.connectionError.set(null);
          
          // Suscribirse a tópicos
          this.subscribeToTopics(username);
          
          resolve();
        },

        onStompError: (frame) => {
          console.error('❌ Error STOMP:', frame);
          this.isConnected.set(false);
          this.connectionError.set(frame.headers['message'] || 'Error de conexión');
          reject(new Error(frame.headers['message']));
        },

        onWebSocketError: (error) => {
          console.error('❌ Error WebSocket:', error);
          this.isConnected.set(false);
          this.connectionError.set('Error de WebSocket');
          reject(error);
        },

        onDisconnect: () => {
          console.log('🔴 WebSocket desconectado');
          this.isConnected.set(false);
        },

        // Configuración adicional
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log('🔵 STOMP Debug:', str);
        }
      });

      // Activar conexión
      this.stompClient.activate();
    });
  }

  /**
   * Suscribirse a los tópicos necesarios
   */
  private subscribeToTopics(username: string): void {
    if (!this.stompClient) return;

    // Tópico público para todos los mensajes
    const publicSub = this.stompClient.subscribe('/topic/public', (message: IMessage) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      console.log('📨 Mensaje público recibido:', chatMessage);
      
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, chatMessage]);
    });
    this.subscriptions.set('public', publicSub);

    // Cola privada para mensajes directos
    const privateSub = this.stompClient.subscribe('/user/queue/private', (message: IMessage) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      console.log('📨 Mensaje privado recibido:', chatMessage);
      
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, chatMessage]);
    });
    this.subscriptions.set('private', privateSub);

    // Notificaciones
    const notifSub = this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
      const notification: ChatMessage = JSON.parse(message.body);
      console.log('🔔 Notificación recibida:', notification);
      this.notificationsSubject.next(notification);
    });
    this.subscriptions.set('notifications', notifSub);

    // Notificaciones personales
    const userNotifSub = this.stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
      const notification: ChatMessage = JSON.parse(message.body);
      console.log('🔔 Notificación personal recibida:', notification);
      this.notificationsSubject.next(notification);
    });
    this.subscriptions.set('userNotifications', userNotifSub);

    // Anunciar que el usuario se unió
    this.sendMessage('/app/chat.addUser', { type: 'JOIN' });
  }

  /**
   * Enviar mensaje público
   */
  sendPublicMessage(content: string): void {
    this.sendMessage('/app/chat.send', { content });
  }

  /**
   * Enviar mensaje privado a un usuario
   */
  sendPrivateMessage(recipient: string, content: string): void {
    this.sendMessage('/app/chat.private', { recipient, content });
  }

  /**
   * Enviar mensaje genérico
   */
  private sendMessage(destination: string, payload: any): void {
    if (this.stompClient && this.isConnected()) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload)
      });
      console.log('📤 Mensaje enviado a', destination);
    } else {
      console.error('❌ No conectado al WebSocket');
    }
  }

  /**
   * Desconectar WebSocket
   */
  disconnect(): void {
    if (this.stompClient) {
      // Cancelar todas las suscripciones
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      // Desactivar cliente
      this.stompClient.deactivate();
      this.stompClient = null;
      
      this.isConnected.set(false);
      console.log('🔴 WebSocket desconectado manualmente');
    }
  }

  /**
   * Limpiar mensajes
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}