import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from "./shared/notification/notificacion/notificacion.component";
import { ExpiracionComponent } from './components/main-pages/options/expiracion/expiracion/expiracion.component';
import { TransactionOverlayComponent } from './shared/components/transaction-overlay/transaction-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ExpiracionComponent, TransactionOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'urban_sings';

  /**
   * Normaliza campos de texto libres al terminar su edición. Se emite un evento
   * `input` para que Angular reactive forms y ngModel guarden el valor real,
   * no únicamente una transformación visual.
   *
   * Para conservar el formato exacto de un campo excepcional, añadir
   * `data-preserve-case` al input o textarea.
   */
  @HostListener('document:focusout', ['$event'])
  normalizeTextCase(event: FocusEvent): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    const normalizedValue = this.getNormalizedValue(target);
    if (normalizedValue === null || normalizedValue === target.value) {
      return;
    }

    target.value = normalizedValue;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private getNormalizedValue(field: HTMLInputElement | HTMLTextAreaElement): string | null {
    if (field.disabled || field.readOnly || field.hasAttribute('data-preserve-case')) {
      return null;
    }

    // Usuario, contraseña y código de verificación son credenciales: su formato
    // nunca se modifica en el cliente. Los correos sí se normalizan a minúscula.
    const credentialControlNames = [
      'usuario',
      'contrasenia',
      'nuevaContrasena',
      'confirmarContrasena'
    ];
    const isCredentialControl = credentialControlNames.includes(field.getAttribute('formControlName') || '')
      || ['username', 'current-password', 'new-password', 'one-time-code'].includes(field.getAttribute('autocomplete') || '');

    if (isCredentialControl || field.closest('app-login, app-verification, app-new-contrasenia')) {
      return null;
    }

    if (field instanceof HTMLInputElement && field.type === 'email') {
      return field.value.trim().toLocaleLowerCase('es-BO');
    }

    if (field instanceof HTMLTextAreaElement) {
      return this.capitalizeFirstLetter(field.value);
    }

    // Buscadores, contraseñas y valores técnicos conservan exactamente su formato.
    if (['search', 'password', 'email', 'number', 'tel', 'url', 'date', 'datetime-local', 'time', 'month', 'week', 'color', 'file', 'hidden', 'range'].includes(field.type)) {
      return null;
    }

    return this.capitalizeFirstLetter(field.value);
  }

  private capitalizeFirstLetter(value: string): string {
    return value.replace(
      /^(\s*)(\p{L})/u,
      (_, whitespace: string, firstLetter: string) => `${whitespace}${firstLetter.toLocaleUpperCase('es-BO')}`
    );
  }
}
