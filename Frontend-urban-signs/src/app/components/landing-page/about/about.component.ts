import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ScrollRevealDirectiveDirective } from '../../../shared/directives/scroll-reveal-directive.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirectiveDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  features = [
    {
      title: 'Más de 500 proyectos completados',
      description: 'Experiencia comprobada en toda Bolivia'
    },
    {
      title: 'Materiales de alta calidad',
      description: 'Importamos los mejores materiales del mercado'
    },
    {
      title: 'Diseño personalizado',
      description: 'Cada proyecto es único y adaptado a tus necesidades'
    },
    {
      title: 'Instalación profesional',
      description: 'Equipo técnico certificado y especializado'
    }
  ];

  images = [
    { id: 1, url: 'img-landing/1.jpg', alt: 'Proyecto 1', offset: false },
    { id: 2, url: 'img-landing/2.jpg', alt: 'Proyecto 2', offset: true },
    { id: 3, url: 'img-landing/3.jpg', alt: 'Proyecto 3', offset: false },
    { id: 4, url: 'img-landing/4.jpg', alt: 'Proyecto 4', offset: true }
  ];
}
