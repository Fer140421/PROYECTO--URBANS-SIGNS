package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionDTO;
import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionRequest;
import com.example.urban_signs.DTO.Solicitudes.SolicitudDetalleDTO;
import com.example.urban_signs.DTO.Solicitudes.SolicitudTrabajoDTO;
import com.example.urban_signs.DTO.Solicitudes.SolicitudTrabajoDetlDTO;
import com.example.urban_signs.DTO.Solicitudes.TrabajoRequest;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Model.SolicitudTrabajoModel;
import com.example.urban_signs.Model.TrabajosModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.SolicitudCotizacionRepository;
import com.example.urban_signs.Repository.SolicitudTrabajoRepository;
import com.example.urban_signs.Repository.TrabajosRepository;
import com.example.urban_signs.Services.SolicitudCotizacionService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.example.urban_signs.Utils.Enum.OrigenSolicitud;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolicitudCotizacionImpl implements SolicitudCotizacionService {
        private final SolicitudCotizacionRepository solicitudCotizacionRepository;
        private final SolicitudTrabajoRepository solicitudTrabajoRepository;
        private final CotizacionRepository cotizacionRepository;
        private final ClienteRepository clienteRepository;
        private final TrabajosRepository trabajoRepository;
        private final CloudinaryService cloudinaryService;

        @Override
        @Transactional
        public SolicitudCotizacionModel registrarSolicitud(SolicitudCotizacionRequest request) {
                return registrarSolicitud(request, null);
        }

        @Override
        @Transactional
        public SolicitudCotizacionModel registrarSolicitud(SolicitudCotizacionRequest request, MultipartFile file) {
                if (solicitudCotizacionRepository.existsByCodSolicitud(request.getCodSolicitud())) {
                        throw new RuntimeException("El código de solicitud ya existe: " + request.getCodSolicitud());
                }

                ClienteModel cliente = clienteRepository.findById(request.getIdCliente())
                                .orElseThrow(() -> new RuntimeException(
                                                "Cliente no encontrado con ID: " + request.getIdCliente()));

                String archivoUrl = request.getArchivoReferencia();
                if (file != null && !file.isEmpty()) {
                        archivoUrl = cloudinaryService.uploadFile(file, CloudinaryFolder.REFERENCIAS_SOLICITUD);
                }

                LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

                SolicitudCotizacionModel solicitud = SolicitudCotizacionModel.builder()
                                .codSolicitud(request.getCodSolicitud())
                                .cliente(cliente)
                                .fechaSolicitud(fechaActualLaPaz)
                                .estado(SolicitudCotizacion.PENDIENTE)
                                .origen(OrigenSolicitud.DASHBOARD)
                                .archivoReferencia(archivoUrl)
                                .observaciones(request.getObservaciones())
                                .build();

                solicitud = solicitudCotizacionRepository.save(solicitud);
                if (request.getTrabajos() != null && !request.getTrabajos().isEmpty()) {
                        List<SolicitudTrabajoModel> trabajos = new ArrayList<>();

                        for (TrabajoRequest t : request.getTrabajos()) {
                                TrabajosModel trabajo = trabajoRepository.findById(t.getIdTrabajo())
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Trabajo no encontrado con ID: " + t.getIdTrabajo()));

                                SolicitudTrabajoModel nuevoTrabajo = SolicitudTrabajoModel.builder()
                                                .solicitud(solicitud)
                                                .trabajo(trabajo)
                                                .cantidad(t.getCantidad())
                                                .base(t.getBase() != null ? BigDecimal.valueOf(t.getBase()) : null)
                                                .altura(t.getAltura() != null ? BigDecimal.valueOf(t.getAltura())
                                                                : null)
                                                .areaTotal((t.getBase() != null && t.getAltura() != null)
                                                                ? BigDecimal.valueOf(t.getBase() * t.getAltura())
                                                                : null)
                                                .descripcion(t.getDescripcion())
                                                .build();

                                trabajos.add(nuevoTrabajo);
                        }

                        solicitudTrabajoRepository.saveAll(trabajos);
                }

                return solicitud;
        }

        @Transactional(readOnly = true)
        @Override
        public Page<SolicitudCotizacionModel> listarSolicitudes(
                        SolicitudCotizacion estado,
                        String codSolicitud,
                        Pageable pageable) {

                if (estado == null) {
                        throw new IllegalArgumentException("El estado es obligatorio");
                }

                int limit = pageable.getPageSize();
                int offset = (int) pageable.getOffset();

                List<SolicitudCotizacionModel> content = solicitudCotizacionRepository.findByFiltrosNative(
                                estado.name(),
                                (codSolicitud != null && !codSolicitud.isBlank()) ? codSolicitud : null,
                                limit,
                                offset);

                long total = solicitudCotizacionRepository.countByFiltros(
                                estado.name(),
                                (codSolicitud != null && !codSolicitud.isBlank()) ? codSolicitud : null);

                return new PageImpl<>(content, pageable, total);
        }

        @Transactional(readOnly = true)
        @Override
        public SolicitudCotizacionDTO obtenerSolicitudConTrabajos(Long idSolicitud) {
                SolicitudCotizacionModel solicitud = solicitudCotizacionRepository.findById(idSolicitud)
                                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
                List<SolicitudTrabajoModel> listaTrabajos = solicitudTrabajoRepository
                                .findBySolicitud_IdSolicitud(idSolicitud);

                List<SolicitudTrabajoDTO> trabajos = listaTrabajos.stream()
                                .map(trabajo -> SolicitudTrabajoDTO.builder()
                                                .idSolicitudTrabajo(trabajo.getIdSolicitudTrabajo())
                                                .trabajoNombre(trabajo.getTrabajo().getNombre())
                                                .cantidad(trabajo.getCantidad())
                                                .base(trabajo.getBase())
                                                .altura(trabajo.getAltura())
                                                .areaTotal(trabajo.getAreaTotal())
                                                .descripcion(trabajo.getDescripcion())
                                                .build())
                                .toList();

                return SolicitudCotizacionDTO.builder()
                                .idSolicitud(solicitud.getIdSolicitud())
                                .codSolicitud(solicitud.getCodSolicitud())
                                .clienteNombre(obtenerNombreCliente(solicitud.getCliente()))
                                .fechaSolicitud(solicitud.getFechaSolicitud())
                                .tipoCliente(solicitud.getCliente().getTipoCliente())
                                .tipoPersonaEmpresa(solicitud.getCliente().getTipoClientePersonaEmpresa())
                                .estado(solicitud.getEstado())
                                .origen(solicitud.getOrigen())
                                .archivoReferencia(solicitud.getArchivoReferencia())
                                .observaciones(solicitud.getObservaciones())
                                .trabajos(trabajos)
                                .build();
        }

        private String obtenerNombreCliente(ClienteModel cliente) {
                if ("PERSONA".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())) {
                        return cliente.getPersona().getName_people() + " " + cliente.getPersona().getAp() + " "
                                        + cliente.getPersona().getAm();
                } else if ("EMPRESA".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())) {
                        return cliente.getEmpresa().getRazonSocial();
                }
                return "Cliente desconocido";
        }

        @Override
        @Transactional
        public SolicitudCotizacionModel modificarSolicitud(Long idSolicitud, SolicitudCotizacionRequest request) {
                SolicitudCotizacionModel solicitudExistente = solicitudCotizacionRepository.findById(idSolicitud)
                                .orElseThrow(() -> new RuntimeException(
                                                "Solicitud no encontrada con ID: " + idSolicitud));

                ClienteModel cliente = clienteRepository.findById(request.getIdCliente())
                                .orElseThrow(() -> new RuntimeException(
                                                "Cliente no encontrado con ID: " + request.getIdCliente()));

                solicitudExistente.setCliente(cliente);
                solicitudExistente.setObservaciones(request.getObservaciones());

                solicitudExistente = solicitudCotizacionRepository.save(solicitudExistente);

                solicitudTrabajoRepository.deleteBySolicitudId(solicitudExistente.getIdSolicitud());

                if (request.getTrabajos() != null && !request.getTrabajos().isEmpty()) {
                        List<SolicitudTrabajoModel> nuevosTrabajos = new ArrayList<>();

                        for (TrabajoRequest t : request.getTrabajos()) {
                                TrabajosModel trabajo = trabajoRepository.findById(t.getIdTrabajo())
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Trabajo no encontrado con ID: " + t.getIdTrabajo()));

                                SolicitudTrabajoModel nuevoTrabajo = SolicitudTrabajoModel.builder()
                                                .solicitud(solicitudExistente)
                                                .trabajo(trabajo)
                                                .cantidad(t.getCantidad())
                                                .base(t.getBase() != null ? BigDecimal.valueOf(t.getBase()) : null)
                                                .altura(t.getAltura() != null ? BigDecimal.valueOf(t.getAltura())
                                                                : null)
                                                .areaTotal((t.getBase() != null && t.getAltura() != null)
                                                                ? BigDecimal.valueOf(t.getBase() * t.getAltura())
                                                                : null)
                                                .descripcion(t.getDescripcion())
                                                .build();

                                nuevosTrabajos.add(nuevoTrabajo);
                        }

                        solicitudTrabajoRepository.saveAll(nuevosTrabajos);
                }

                return solicitudExistente;
        }

        @Override
        @Transactional(readOnly = true)
        public SolicitudDetalleDTO obtenerDetalle(Long idSolicitud) {
                SolicitudCotizacionModel solicitud = solicitudCotizacionRepository.findById(idSolicitud)
                                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

                var trabajos = solicitudTrabajoRepository.findBySolicitudId(idSolicitud);

                List<SolicitudTrabajoDetlDTO> trabajosDTO = trabajos.stream()
                                .map(t -> SolicitudTrabajoDetlDTO.builder()
                                                .idSolicitudTrabajo(t.getIdSolicitudTrabajo())
                                                .idTrabajo(t.getTrabajo().getIdTrabajo())
                                                .nombreTrabajo(t.getTrabajo().getNombre())
                                                .cantidad(t.getCantidad())
                                                .base(t.getBase())
                                                .altura(t.getAltura())
                                                .areaTotal(t.getAreaTotal())
                                                .descripcion(t.getDescripcion())
                                                .build())
                                .toList();

                return SolicitudDetalleDTO.builder()
                                .idSolicitud(solicitud.getIdSolicitud())
                                .codSolicitud(solicitud.getCodSolicitud())
                                .cliente(solicitud.getCliente())
                                .fechaSolicitud(solicitud.getFechaSolicitud())
                                .estado(solicitud.getEstado())
                                .origen(solicitud.getOrigen())
                                .archivoReferencia(solicitud.getArchivoReferencia())
                                .observaciones(solicitud.getObservaciones())
                                .trabajos(trabajosDTO)
                                .build();
        }

        @Override
        public void cancelarSolicitud(Long idSolicitud) {
                SolicitudCotizacionModel solicitud = solicitudCotizacionRepository.findById(idSolicitud)
                                .orElseThrow(() -> new RuntimeException(
                                                "Solicitud no encontrada con ID: " + idSolicitud));

                if (solicitud.getEstado().equals(SolicitudCotizacion.PENDIENTE)
                                || solicitud.getEstado().equals(SolicitudCotizacion.REVISION)) {

                        solicitud.setEstado(SolicitudCotizacion.CANCELADA);
                        solicitudCotizacionRepository.save(solicitud);

                } else if (solicitud.getEstado().equals(SolicitudCotizacion.COTIZADA)) {
                        CotizacionModel cotizacion = cotizacionRepository.findBySolicitud(solicitud);

                        if (cotizacion != null) {
                                if (cotizacion.getEstado().equals(EstadoCotizacion.PENDIENTE)) {
                                        cotizacion.setEstado(EstadoCotizacion.CADUCADA);
                                        cotizacionRepository.save(cotizacion);
                                        solicitud.setEstado(SolicitudCotizacion.CANCELADA);
                                        solicitudCotizacionRepository.save(solicitud);
                                } else if (cotizacion.getEstado().equals(EstadoCotizacion.APROBADA)) {
                                        throw new RuntimeException(
                                                        "No se puede cancelar una solicitud con cotización aprobada.");
                                }
                        }
                }
        }

}
