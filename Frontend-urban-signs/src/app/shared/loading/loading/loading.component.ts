import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  @Input() fullscreen = false;
  @Input() label = 'Cargando listado';
  @Input() variant: 'table' | 'cards' | 'list' = 'table';
  @Input() rows = 6;
  @Input() columns = 5;

  get rowItems(): number[] {
    return Array.from({ length: this.rows }, (_, index) => index);
  }

  get columnItems(): number[] {
    return Array.from({ length: this.columns }, (_, index) => index);
  }
}
