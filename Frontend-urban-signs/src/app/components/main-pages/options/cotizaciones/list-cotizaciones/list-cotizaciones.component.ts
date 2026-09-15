import { Component, inject, Input } from '@angular/core';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetallesCotizacionComponent } from "../detalles-cotizacion/detalles-cotizacion.component";
import { ModificarCotizacionComponent } from "../modificar-cotizacion/modificar-cotizacion.component";
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { HasPermissionDirective } from '../../../../../shared/directives/has-permission.directive';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-list-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DetallesCotizacionComponent, ModificarCotizacionComponent,
    LoadingComponent, ViewToggleComponent, HasPermissionDirective, ResponsiveDataViewComponent,
    DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-cotizaciones.component.html',
  styleUrl: './list-cotizaciones.component.css'
})
export class ListCotizacionesComponent {
  viewMode: 'list' | 'cards' = 'list';
  solicitudesService = inject(SolicitudService);
  notificacionService = inject(NotificationService);
  cotService = inject(CotizacionService);
  Listsolicitudes: any[] = [];
  @Input() cotizacion: any | null = null;
  isModalOpen: boolean = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 5;
  Math = Math;
  estadoSeleccionado: string = 'PENDIENTE';
  terminoBusqueda: string = '';
  mostrarModalModificacion = false;
  mostrarModalVisualizacion = false;
  cotizacionSeleccionada: any;
  solicitudes: any[] = [];
  cargando = false;
  cargandoDetalle = false;
  ListCotizaciones: any[] = [];
  isDeleteModalOpen: boolean = false;
  ordenSeleccionada: any = null;
  searchTerm: string = '';

  ngOnInit() {
    this.loadCotizaciones();
  }
  loadCotizaciones(): void {
    this.cargando = true;
    const backendPage = this.currentPage - 1;

    this.cotService
      .listarCotizaciones(this.estadoSeleccionado, this.searchTerm, backendPage, this.itemsPerPage)
      .subscribe({
        next: (data) => {
          this.ListCotizaciones = data.content;
          console.log(this.ListCotizaciones);
          this.totalItems = data.totalElements;
          this.totalPages = data.totalPages;
          this.cargando = false;

          if (this.ListCotizaciones.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadCotizaciones();
          }
        },
        error: (err) => {
          console.error(err);
          this.notificacionService.error('Error al cargar las cotizaciones');
          this.cargando = false;
        }
      });
  }

  closeModal() {
    this.isModalOpen = false;
    this.cotizacion = null;
  }

  cambiarEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.currentPage = 1;
    this.loadCotizaciones();
  }

  buscar() {
    this.currentPage = 1;
    this.searchTerm = this.terminoBusqueda.trim();
    this.loadCotizaciones();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCotizaciones();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCotizaciones();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadCotizaciones();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginated(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.Listsolicitudes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  async imprimirCotizacion(data: any): Promise<void> {
    const detalles = await this.cotService.obtenerDetalleCotizacion(data.idCotizacion).toPromise();

    // 2) Cargar logo en base64
    const logo = await this.convertImgToBase64('/img-logos/foto.png');

    // 3) Validar trabajos
    if (!detalles.trabajos || detalles.trabajos.length === 0) {
      this.notificacionService.error("La cotización no tiene trabajos registrados.");
      return;
    }

    const fechaEmision = new Date(detalles.fechaEmision).toLocaleDateString();
    const fechaCaducado = new Date(detalles.fechaCaducado).toLocaleDateString();

    // 4) Recuperar cliente completo desde el objeto que se pasa
    const cliente = data.solicitud.cliente; // <-- Datos completos desde la lista
    console.log('Cliente para cotización PDF:', cliente);

    // 5) Preparar información del cliente según tipo
    let clienteInfo: any[] = [];
    if (cliente.tipoClientePersonaEmpresa === 'Empresa') {
      clienteInfo = [
        { text: `Empresa: ${cliente.empresa.razonSocial}`, margin: [0, 0, 0, 2] },
        { text: `NIT: ${cliente.empresa.nit}`, margin: [0, 0, 0, 2] },
        { text: `Dirección: ${cliente.empresa.direccion}`, margin: [0, 0, 0, 2] },
        { text: `Teléfono: ${cliente.empresa.telefono}`, margin: [0, 0, 0, 2] },
        { text: `Email: ${cliente.correo}`, margin: [0, 0, 0, 2] }
      ];
    } else { // Persona
      clienteInfo = [
        { text: `Cliente: ${cliente.persona.name_people} ${cliente.am} ${cliente.ap}`, margin: [0, 0, 0, 2] },
        { text: `C.I.: ${cliente.persona.ci}`, margin: [0, 0, 0, 2] },
        { text: `Teléfono: ${cliente.persona.phone_number}`, margin: [0, 0, 0, 2] },
        { text: `Email: ${cliente.correo}`, margin: [0, 0, 0, 2] }
      ];
    }

    // 6) Preparar filas de trabajos con Base y Altura
    const trabajosTable = detalles.trabajos.map((t: any) => {
      return [
        { text: t.cantidad, alignment: 'center' },
        { text: t.nombreTrabajo, alignment: 'center' },
        { text: `${t.base} m`, alignment: 'center' },
        { text: `${t.altura} m`, alignment: 'center' },
        { text: `${t.area_total} m²`, alignment: 'center' },
        { text: `${t.costoUnitario} Bs`, alignment: 'center' },
        { text: `${t.subtotal} Bs`, alignment: 'center' }
      ];
    });

    // 7) Encabezado de tabla
    const tablaEncabezado = [
      [
        { text: "Cant.", bold: true, alignment: "center" },
        { text: "Descripción", bold: true, alignment: "center" },
        { text: "Base (m)", bold: true, alignment: "center" },
        { text: "Altura (m)", bold: true, alignment: "center" },
        { text: "Área Total (m²)", bold: true, alignment: "center" },
        { text: "Unitario (Bs)", bold: true, alignment: "center" },
        { text: "Subtotal (Bs)", bold: true, alignment: "center" }
      ]
    ];

    // 8) Definir documento PDF
    const documentDefinition: any = {
      content: [
        // Logo y encabezado
        {
          columns: [
            { image: logo, width: 70, margin: [0, 0, 0, 10] },
            {
              stack: [
                { text: "URBAN SIGNS", style: "titulo" },
                { text: "INDUSTRIA PUBLICITARIA", style: "subtituloLogo" }
              ],
              alignment: 'center'
            }
          ]
        },

        // Datos generales
        {
          columns: [
            { text: `Cotización Nº: ${detalles.codCotizacion}`, bold: true },
            { text: `Fecha: ${fechaEmision}`, alignment: 'right' }
          ],
          margin: [0, 0, 0, 10]
        },

        // Datos del cliente
        { text: "DATOS DEL CLIENTE", style: "subtitulo" },
        ...clienteInfo,
        { text: "\n" },

        // Detalle del trabajo
        { text: "DETALLE DEL TRABAJO", style: "subtitulo" },
        {
          table: {
            widths: ["8%", "25%", "12%", "12%", "12%", "15%", "16%"],
            body: [
              ...tablaEncabezado,
              ...trabajosTable
            ]
          },
          layout: "lightHorizontalLines"
        },

        { text: "\n" },

        // Total
        {
          alignment: "right",
          text: `COSTO TOTAL: ${detalles.costoTotal} Bs`,
          style: "total"
        },

        { text: "\n" },

        // Condiciones comerciales
        { text: "CONDICIONES COMERCIALES", style: "subtitulo" },
        {
          ul: [
            "FECHA DE INICIO: A partir de la recepción de material necesario para la elaboración del trabajo y el pago del 50% del valor total.",
            "LOS VALORES ESTÁN EXPRESADOS EN BOLIVIANOS.",
            "COLOCADO DE TRABAJO: Válido para área urbana de Tarija - Cercado.",
            "VALIDEZ DE LA COTIZACIÓN: 15 días.",
            "EL PRECIO INCLUYE IMPUESTOS DE LEY."
          ]
        },

        { text: "\n" },

        // Pie de página
        {
          text: "DIR: CALLE AVAROA ENTRE SUCRE Y GENERAL TRIGO Nº370",
          alignment: "center",
          margin: [0, 10, 0, 0],
          fontSize: 10
        }
      ],

      styles: {
        titulo: { fontSize: 20, bold: true },
        subtituloLogo: { fontSize: 12 },
        subtitulo: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        total: { fontSize: 16, bold: true }
      }
    };

    pdfMake.createPdf(documentDefinition).open();
  }


  abrirModal(solicitud: any): void {
    this.cargandoDetalle = true;
    this.cotService.obtenerDetalleCotizacion(solicitud.idCotizacion).subscribe({
      next: (detalle) => {
        this.cotizacionSeleccionada = detalle;
        this.mostrarModalModificacion = true;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }

  onCotizacionGuardada(cotizacion: any): void {
    console.log('Cotización guardada:', cotizacion);
    this.notificacionService.show('Cotización modificada exitosamente');
    this.loadCotizaciones(); // Recargar la lista
    this.cerrarModalModificacion();
  }

  visualizarModal(solicitud: any): void {
    this.cargandoDetalle = true;
    this.cotService.obtenerDetalleCotizacion(solicitud.idCotizacion).subscribe({
      next: (detalle) => {
        this.cotizacionSeleccionada = detalle;
        this.mostrarModalVisualizacion = true;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }

  cerrarModalModificacion(): void {
    this.mostrarModalModificacion = false;
    this.cotizacionSeleccionada = null;
  }

  cerrarModalVisualizacion(): void {
    this.mostrarModalVisualizacion = false;
    this.cotizacionSeleccionada = null;
  }

  onSolicitudGuardada(solicitudActualizada: any): void {
    this.notificacionService.success('Solicitud actualizada exitosamente');
    const index = this.solicitudes.findIndex(s => s.idSolicitud === solicitudActualizada.idSolicitud);
    if (index !== -1) {
      this.solicitudes[index] = solicitudActualizada;
    }
    this.cerrarModalModificacion();
  }

  onErrorModal(mensaje: string): void {
    this.notificacionService.error(mensaje);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.ordenSeleccionada = null;
  }

  convertImgToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }


}
