import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface FAQ {
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}
@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.css'
})
export class AyudaComponent {
  searchQuery = '';
  selectedCategory = '';

  categories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Primeros Pasos',
      icon: 'ph-rocket-launch',
      description: 'Comienza a usar el sistema'
    },
    {
      id: 'projects',
      name: 'Proyectos',
      icon: 'ph-folder',
      description: 'Gestión de proyectos'
    },
    {
      id: 'designs',
      name: 'Diseños',
      icon: 'ph-palette',
      description: 'Creación y edición'
    },
    {
      id: 'account',
      name: 'Mi Cuenta',
      icon: 'ph-user-circle',
      description: 'Configuración personal'
    }
  ];

  faqs: FAQ[] = [
    {
      question: '¿Cómo puedo crear un nuevo proyecto?',
      answer: 'Para crear un nuevo proyecto, ve al menú "Proyectos" y haz clic en el botón "Nuevo Proyecto". Completa los campos requeridos como nombre, cliente, fecha de inicio y descripción. Luego haz clic en "Guardar".',
      category: 'projects'
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a "Mi Perfil" en el menú superior, luego dirígete a la sección "Seguridad". Ingresa tu contraseña actual y la nueva contraseña dos veces para confirmar. Haz clic en "Cambiar Contraseña".',
      category: 'account'
    },
    {
      question: '¿Puedo subir archivos de diseño?',
      answer: 'Sí, puedes subir archivos en formato PDF, AI, PSD, PNG y JPG. El tamaño máximo por archivo es de 50MB. Ve a tu proyecto y haz clic en "Subir Archivos".',
      category: 'designs'
    },
    {
      question: '¿Cómo asigno tareas a mi equipo?',
      answer: 'Dentro de un proyecto, ve a la sección "Tareas" y haz clic en "Nueva Tarea". Completa los detalles y selecciona el empleado responsable en el campo "Asignar a".',
      category: 'projects'
    },
    {
      question: '¿Qué navegadores son compatibles?',
      answer: 'El sistema es compatible con las últimas versiones de Chrome, Firefox, Safari y Edge. Recomendamos mantener tu navegador actualizado para mejor rendimiento.',
      category: 'getting-started'
    },
    {
      question: '¿Cómo puedo exportar reportes?',
      answer: 'En la sección de reportes, selecciona el tipo de reporte que necesitas, ajusta los filtros y fechas, luego haz clic en el botón "Exportar". Puedes elegir formato PDF o Excel.',
      category: 'projects'
    },
    {
      question: '¿Puedo personalizar mi panel de control?',
      answer: 'Sí, puedes personalizar los widgets que se muestran en tu panel. Haz clic en el ícono de engranaje en la esquina superior del panel y selecciona qué información deseas ver.',
      category: 'getting-started'
    },
    {
      question: '¿Cómo recupero mi contraseña?',
      answer: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y recibirás un enlace para restablecer tu contraseña.',
      category: 'account'
    },
    {
      question: '¿Puedo trabajar sin conexión a internet?',
      answer: 'Actualmente el sistema requiere conexión a internet para funcionar. Estamos trabajando en una función de modo offline para futuras versiones.',
      category: 'getting-started'
    },
    {
      question: '¿Cómo actualizo la información de un cliente?',
      answer: 'Ve al módulo "Clientes", busca el cliente que deseas editar y haz clic en el ícono de edición. Actualiza la información necesaria y guarda los cambios.',
      category: 'projects'
    }
  ];

  filteredFAQs: FAQ[] = [...this.faqs];

  filterFAQs(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredFAQs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filteredFAQs = this.faqs.filter(faq => faq.category === categoryId);
  }

  clearCategory(): void {
    this.selectedCategory = '';
    this.filteredFAQs = [...this.faqs];
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterFAQs();
  }

  toggleFAQ(faq: FAQ): void {
    faq.expanded = !faq.expanded;
  }

  sendFeedback(type: 'positive' | 'negative'): void {
    console.log('Feedback:', type);
    alert(type === 'positive' ? '¡Gracias por tu feedback positivo!' : 'Gracias por tu feedback. Trabajaremos para mejorar.');
  }
}
