import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ScrollRevealDirectiveDirective } from '../../../shared/directives/scroll-reveal-directive.directive';
import { Project } from '../../../core/models/landing-pages/project.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirectiveDirective],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent {
  selectedCategory = signal('all');

  categories = [
    { id: 'all', label: 'Todos' },
    { id: 'banners', label: 'Banners' },
    { id: 'letreros', label: 'Letreros' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'rotulacion', label: 'Rotulación' }
  ];

  projects: Project[] = [
    {
      id: '1',
      title: 'Banner Festival Internacional',
      description: 'Gran formato para evento cultural',
      image: 'img-landing/2.jpg',
      category: 'banners',
      delay: '0.1s'
    },
    {
      id: '2',
      title: 'Gigantografía Centro Comercial',
      description: 'Impresión de alta definición',
      image: 'img-landing/5.jpg',
      category: 'banners',
      delay: '0.2s'
    },
    {
      id: '3',
      title: 'Letrero Luminoso Premium',
      description: 'Diseño e instalación para restaurante',
      image: 'img-landing/3.jpg',
      category: 'letreros',
      delay: '0.3s'
    },
    {
      id: '4',
      title: 'Stand Feria Empresarial',
      description: 'Estructura modular personalizada',
      image: 'img-landing/7.jpg',
      category: 'eventos',
      delay: '0.4s'
    },
    {
      id: '5',
      title: 'Rotulación Flota Vehicular',
      description: 'Branding para empresa de logística',
      image: 'img-landing/13.jpg',
      category: 'rotulacion',
      delay: '0.5s'
    },
    {
      id: '6',
      title: 'Señalización Corporativa',
      description: 'Sistema integral de wayfinding',
      image: 'img-landing/11.jpg',
      category: 'letreros',
      delay: '0.6s'
    }
  ];

  filteredProjects = signal<Project[]>(this.projects);

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    if (categoryId === 'all') {
      this.filteredProjects.set(this.projects);
    } else {
      this.filteredProjects.set(
        this.projects.filter(p => p.category === categoryId)
      );
    }
  }
}
