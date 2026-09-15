import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { ModificarSolicitudComponent } from '../modificar-solicitud/modificar-solicitud.component';
import { VisualizarComponent } from "../visualizar/visualizar.component";
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { HasPermissionDirective } from '../../../../../shared/directives/has-permission.directive';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { finalize } from 'rxjs';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-list-cotizacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ModificarSolicitudComponent,
    VisualizarComponent,
    LoadingComponent,
    ViewToggleComponent,
    HasPermissionDirective,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ActionIconButtonComponent
  ],
  templateUrl: './list-solicitudes.component.html',
  styleUrl: './list-solicitudes.component.css'
})
export class ListSolicitudesComponent implements OnInit {
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
  solicitudSeleccionada: any;
  solicitudes: any[] = [];
  cargando = false;
  cargandoDetalle = false;
  isDeleteModalOpen: boolean = false;
  ordenSeleccionada: any = null;
  isProcessing = false;

  ngOnInit() {
    this.loadCotizaciones();
  }

  loadCotizaciones() {
    this.cargando = true;
    const backendPage = this.currentPage - 1;

    this.solicitudesService
      .listarSolicitudes(backendPage, this.pageSize, this.estadoSeleccionado, this.terminoBusqueda)
      .subscribe({
        next: (data) => {
          this.Listsolicitudes = data.content;
          console.log(this.Listsolicitudes)
          this.totalItems = data.totalElements;
          this.totalPages = data.totalPages;
          this.cargando = false;
          if (this.Listsolicitudes.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadCotizaciones();
          }
        },

        error: (err) => {
          console.error(err);
          this.notificacionService.error('Error al cargar las solicitudes');
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
    this.currentPage = 0;
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

  abrirModal(solicitud: any): void {
    if (this.cargandoDetalle) return;
    this.cargandoDetalle = true;
    this.solicitudesService.obtenerDetalle(solicitud.idSolicitud).subscribe({
      next: (detalle) => {
        this.solicitudSeleccionada = detalle;
        this.mostrarModalModificacion = true;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }

  visualizarModal(solicitud: any): void {
    if (this.cargandoDetalle) return;
    this.cargandoDetalle = true;
    this.solicitudesService.obtenerDetalle(solicitud.idSolicitud).subscribe({
      next: (detalle) => {
        this.solicitudSeleccionada = detalle;
        this.mostrarModalVisualizacion = true;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }

  cerrarModalModificacion(): void {
    this.mostrarModalModificacion = false;
    this.solicitudSeleccionada = null;
  }

  cerrarModalVisualizacion(): void {
    this.mostrarModalVisualizacion = false;
    this.solicitudSeleccionada = null;
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

  onCancelarCompra() {
    if (this.isProcessing || !this.ordenSeleccionada?.idSolicitud) return;

    this.isProcessing = true;
    this.solicitudesService.cancelarSolicitud(this.ordenSeleccionada.idSolicitud).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (compraCancelada) => {
        this.isDeleteModalOpen = false;
        this.loadCotizaciones();
        this.notificacionService.success('Se ha anulado la solicitud de cotizacion.');
      },
      error: (err) =>
        this.notificacionService.error('Error al cancelar la solicitud.')
    });
  }

  // Cerrar modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.ordenSeleccionada = null;
  }

  openDeleteModal(orden: any) {
    this.ordenSeleccionada = orden;
    this.isDeleteModalOpen = true;
  }

  async imprimirSolicitud(data: any): Promise<void> {
    try {
      // 1) Obtener detalle completo de la solicitud
      const detalles = await this.solicitudesService.obtenerDetalle(data.idSolicitud).toPromise();

      // 2) Cargar logo
      const logo = await this.convertImgToBase64('/img-logos/foto.png');

      // 3) Validar trabajos
      if (!detalles.trabajos || detalles.trabajos.length === 0) {
        this.notificacionService.error("La solicitud no tiene trabajos registrados.");
        return;
      }

      const fechaSolicitud = new Date(detalles.fechaSolicitud).toLocaleDateString();

      // 4) Cliente viene completo en 'detalles.cliente'
      const cliente = detalles.cliente;

      // 5) Información del cliente según tipo
      let clienteInfo: any[] = [];

      if (cliente.tipoClientePersonaEmpresa === "Empresa") {
        clienteInfo = [
          { text: `Empresa: ${cliente.empresa.razonSocial}`, margin: [0, 0, 0, 2] },
          { text: `NIT: ${cliente.empresa.nit}`, margin: [0, 0, 0, 2] },
          { text: `Dirección: ${cliente.empresa.direccion}`, margin: [0, 0, 0, 2] },
          { text: `Teléfono: ${cliente.empresa.telefono}`, margin: [0, 0, 0, 2] },
          { text: `Email: ${cliente.correo}`, margin: [0, 0, 0, 2] }
        ];
      } else {
        clienteInfo = [
          { text: `Cliente: ${cliente.persona.name_people} ${cliente.persona.ap} ${cliente.persona.am}`, margin: [0, 0, 0, 2] },
          { text: `C.I.: ${cliente.persona.ci}`, margin: [0, 0, 0, 2] },
          { text: `Teléfono: ${cliente.persona.phone_number}`, margin: [0, 0, 0, 2] },
          { text: `Email: ${cliente.correo}`, margin: [0, 0, 0, 2] }
        ];
      }

      // 6) Filas de trabajos
      const trabajosTable = detalles.trabajos.map((t: any) => {
        return [
          { text: t.cantidad, alignment: "center" },
          { text: t.nombreTrabajo, alignment: "center" },
          { text: `${t.base} m`, alignment: "center" },
          { text: `${t.altura} m`, alignment: "center" },
          { text: `${t.areaTotal} m²`, alignment: "center" },
          { text: t.descripcion || "-", alignment: "center" }
        ];
      });

      // 7) Encabezado tabla
      const tablaEncabezado = [
        [
          { text: "Cant.", bold: true, alignment: "center" },
          { text: "Descripción", bold: true, alignment: "center" },
          { text: "Base (m)", bold: true, alignment: "center" },
          { text: "Altura (m)", bold: true, alignment: "center" },
          { text: "Área Total (m²)", bold: true, alignment: "center" },
          { text: "Notas", bold: true, alignment: "center" }
        ]
      ];

      // 8) Documento PDF
      const documentDefinition: any = {
        content: [
          // Logo y encabezado
          {
            columns: [
              { image: logo, width: 70, margin: [0, 0, 0, 10] },
              {
                stack: [
                  { text: "URBAN SIGNS", style: "titulo" },
                  { text: "SOLICITUD DE COTIZACIÓN", style: "subtituloLogo" }
                ],
                alignment: "center"
              }
            ]
          },

          // Datos generales
          {
            columns: [
              { text: `Solicitud Nº: ${detalles.codSolicitud}`, bold: true },
              { text: `Fecha: ${fechaSolicitud}`, alignment: "right" }
            ],
            margin: [0, 0, 0, 10]
          },

          // Estado
          {
            text: `Estado: ${detalles.estado}`,
            bold: true,
            margin: [0, 0, 0, 10]
          },

          // Datos del cliente
          { text: "DATOS DEL CLIENTE", style: "subtitulo" },
          ...clienteInfo,
          { text: "\n" },

          // Trabajos
          { text: "TRABAJOS SOLICITADOS", style: "subtitulo" },
          {
            table: {
              widths: ["8%", "28%", "13%", "13%", "15%", "25%"],
              body: [
                ...tablaEncabezado,
                ...trabajosTable
              ]
            },
            layout: "lightHorizontalLines"
          },

          { text: "\n" },

          // Observaciones generales
          {
            text: "OBSERVACIONES",
            style: "subtitulo"
          },
          { text: detalles.observaciones || "Sin observaciones" },

          { text: "\n\n" },

          // Pie de página
          {
            text: "URBAN SIGNS - INDUSTRIA PUBLICITARIA\nDIR: CALLE AVAROA ENTRE SUCRE Y GENERAL TRIGO Nº370",
            alignment: "center",
            fontSize: 10,
            margin: [0, 20, 0, 0]
          }
        ],

        styles: {
          titulo: { fontSize: 20, bold: true },
          subtituloLogo: { fontSize: 12 },
          subtitulo: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
        }
      };

      pdfMake.createPdf(documentDefinition).open();

    } catch (error) {
      this.notificacionService.error("No se pudo generar el PDF de la solicitud.");
    }
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
