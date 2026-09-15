import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirectiveDirective } from '../../../shared/directives/scroll-reveal-directive.directive';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirectiveDirective],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent {
  services: any[] = [
    {
      id: '1',
      title: 'BTL',
      description: 'Elaboración de stands para ferias, armados, juegos publicitarios, asesoría y eventos corporativos.',
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    {
      id: '2',
      title: 'Letreros',
      description: 'Confección de letreros luminosos, bastidores, letras en acero inoxidable, acrílico, metálicas y trupán.',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    },
    {
      id: '3',
      title: 'Impresión Digital',
      description: 'Diseño y confección de banners, rollers, pasacalles, adhesivos y esmerilados de alta calidad.',
      iconPath: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
    },
    {
      id: '4',
      title: 'Rotulación',
      description: 'Personalización de vehículos, camiones, autos, motos y equipos electrónicos como laptops.',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      id: '5',
      title: 'Señalización',
      description: 'Señalización horizontal, vertical, vial, de seguridad e informativa para espacios públicos y privados.',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    {
      id: '6',
      title: 'Display',
      description: 'Banderolas, porta folletos, mesas publicitarias, pop ups, toldos y estructuras promocionales.',
      iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
    },
    {
      id: '7',
      title: 'Diseño Gráfico',
      description: 'Imagen institucional, logotipos profesionales, arte para web y diseño para redes sociales.',
      iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];
}
