import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ScrollRevealDirectiveDirective } from '../../../Core/directives/scroll-reveal-directive.directive';

@Component({
  selector: 'app-servicios',
  imports: [CommonModule, ScrollRevealDirectiveDirective],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {

}
