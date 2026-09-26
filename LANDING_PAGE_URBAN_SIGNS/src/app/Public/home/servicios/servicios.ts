import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ScrollRevealDirectiveDirective } from '../../../Core/directives/scroll-reveal-directive.directive';
import { PortalDataService } from '../../../Core/Service/Portal/portal-data.service';
import { PublicService } from '../../../Core/Models/client-portal.model';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirectiveDirective],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios implements OnInit {
  private readonly portalData = inject(PortalDataService);
  private readonly router = inject(Router);

  servicios: PublicService[] = [];
  isLoading = true;

  // Respaldo de alta calidad visual en caso de que la BD no tenga registros o esté iniciando
  readonly fallbackServicios: PublicService[] = [
    {
      idTrabajo: 1,
      nombre: 'Letreros Luminosos',
      descripcion: 'Cajas de luz, letras corpóreas en acrílico, metal e INOX con iluminación LED de alta durabilidad.',
      foto: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
    },
    {
      idTrabajo: 2,
      nombre: 'BTL & Eventos',
      descripcion: 'Stands para ferias empresariales, escenografías, módulos de interacción y ambientación publicitaria.',
      foto: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
    },
    {
      idTrabajo: 3,
      nombre: 'Impresión Digital & Banners',
      descripcion: 'Gigantografías en lona frontlight, backlight, rollers, adhesivos microperforados y vinil reflectivo.',
      foto: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    },
    {
      idTrabajo: 4,
      nombre: 'Rotulación Vehicular',
      descripcion: 'Branding integral para flotas comerciales, camionetas, furgones y motocicletas con vinil de alto impacto.',
      foto: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
    },
    {
      idTrabajo: 5,
      nombre: 'Señalización Vial e Industrial',
      descripcion: 'Señales de seguridad industrial, normativas, paneles informativos para plantas, minería y oficinas.',
      foto: 'https://images.unsplash.com/photo-1572945550749-87590b0ab642?auto=format&fit=crop&w=800&q=80'
    },
    {
      idTrabajo: 6,
      nombre: 'Displays & Estructuras',
      descripcion: 'Toldos promocionales, marcos de tensión, portafolletos y puntos de venta personalizados.',
      foto: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80'
    }
  ];

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.isLoading = true;
    this.portalData.getPublicServices().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.servicios = data;
        } else {
          this.servicios = this.fallbackServicios;
        }
        this.isLoading = false;
      },
      error: () => {
        this.servicios = this.fallbackServicios;
        this.isLoading = false;
      }
    });
  }

  cotizarServicio(servicio: PublicService): void {
    this.router.navigate(['/cotizaciones'], {
      queryParams: { servicio: servicio.nombre }
    });
  }

  getWhatsAppLink(servicio: PublicService): string {
    const text = `Hola Urban Signs, me interesa cotizar el servicio de ${servicio.nombre}. ¿Podrían brindarme más información?`;
    return `https://wa.me/59165807763?text=${encodeURIComponent(text)}`;
  }

  onImageError(event: Event, index: number): void {
    const img = event.target as HTMLInputElement;
    if (img) {
      // Reemplazo con imagen genérica de respaldo de Urban Signs
      const fallbacks = [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
      ];
      img.src = fallbacks[index % fallbacks.length];
    }
  }
}
