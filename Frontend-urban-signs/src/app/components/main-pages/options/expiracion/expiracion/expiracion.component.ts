import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SesionService } from '../../../../../core/services/sesion/sesion.service';

@Component({
  selector: 'app-expiracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiracion.component.html',
  styleUrl: './expiracion.component.css'
})
export class ExpiracionComponent {
  sessionMonitor = inject(SesionService);

}
