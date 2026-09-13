package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Cotizaciones.CotizacionRequest;
import com.example.urban_signs.DTO.Cotizaciones.CotizacionTrabajoRequest;
import com.example.urban_signs.DTO.Cotizaciones.DetalleCotizacionRequest;
import com.example.urban_signs.DTO.Cotizaciones.ListDetalle.CotizacionDetalleDTO;
import com.example.urban_signs.DTO.Cotizaciones.ListDetalle.CotizacionTrabajoDTO;
import com.example.urban_signs.DTO.Cotizaciones.ListDetalle.DetalleMaterialDTO;
import com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion.CotizacionTrabajoMod;
import com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion.ModificarCotizacionMod;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.ClienteDTO;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.ConfirmacionPedidoDTO;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.CotizacionInfoDTO;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.TrabajoCotizadoDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.CotizacionTrabajoModel;
import com.example.urban_signs.Model.DetalleCotizacionModel;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Model.SolicitudTrabajoModel;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.MaterialProduccionRepository;
import com.example.urban_signs.Repository.SolicitudCotizacionRepository;
import com.example.urban_signs.Repository.SolicitudTrabajoRepository;
import com.example.urban_signs.Services.CotizacionService;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CotizacionServiceImpl implements CotizacionService {

        private final CotizacionRepository cotizacionRepository;
        private final SolicitudCotizacionRepository solicitudeCotizacionRepo;
        private final SolicitudTrabajoRepository solicitudTrabajoRepository;
        private final MaterialProduccionRepository materialProduccionRepository;

        @Override
        @Transactional(readOnly = true)
        public Page<CotizacionModel> listar(Pageable pageable) {
                return cotizacionRepository.findAll(pageable);
        }

        @Override
        @Transactional
        public void modificarTrabajosCotizacion(Long idCotizacion, ModificarCotizacionMod request) {
                CotizacionModel cotizacion = cotizacionRepository.findById(idCotizacion)
                                .orElseThrow(() -> new RuntimeException(
                                                "Cotización no encontrada con ID: " + idCotizacion));

                for (CotizacionTrabajoMod t : request.getTrabajos()) {
                        // Buscar el trabajo
                        CotizacionTrabajoModel trabajo = cotizacion.getTrabajos().stream()
                                        .filter(trab -> trab.getIdCotizacionTrabajo()
                                                        .equals(t.getIdCotizacionTrabajo()))
                                        .findFirst()
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Trabajo no encontrado con ID: " + t.getIdCotizacionTrabajo()));

                        trabajo.setCantidad(t.getCantidad());
                        trabajo.setCostoUnitario(t.getCostoUnitario());
                        trabajo.setSubtotal(t.getSubtotal());

                        // CAMBIO IMPORTANTE: Limpiar la lista existente
                        trabajo.getDetalles().clear();

                        // Crear los nuevos detalles
                        List<DetalleCotizacionModel> nuevosDetalles = t.getMateriales().stream()
                                        .map(m -> {
                                                MaterialProduccionModel material = materialProduccionRepository
                                                                .findById(m.getIdMaterial())
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Material no encontrado con ID: "
                                                                                                + m.getIdMaterial()));
                                                return DetalleCotizacionModel.builder()
                                                                .cotizacionTrabajo(trabajo)
                                                                .material(material)
                                                                .build();
                                        })
                                        .collect(Collectors.toList());
                        trabajo.getDetalles().addAll(nuevosDetalles);
                }

                BigDecimal total = cotizacion.getTrabajos().stream()
                                .map(CotizacionTrabajoModel::getSubtotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                cotizacion.setCostoTotal(total);
                cotizacionRepository.save(cotizacion);
        }

        @Override
        public void eliminar(Long id) {
                cotizacionRepository.deleteById(id);
        }

        @Override
        @Transactional
        public CotizacionModel registrarCotizacion(CotizacionRequest request) {
                SolicitudCotizacionModel solicitud = solicitudeCotizacionRepo.findById(request.getIdSolicitud())
                                .orElseThrow(() -> new RuntimeException(
                                                "Solicitud no encontrada con ID: " + request.getIdSolicitud()));

                LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

                CotizacionModel cotizacion = CotizacionModel.builder()
                                .codCotizacion(solicitud.getCodSolicitud())
                                .solicitud(solicitud)
                                .fechaEmision(fechaActualLaPaz)
                                .fechaCaducado(fechaActualLaPaz.plusDays(15))
                                .estado(EstadoCotizacion.PENDIENTE)
                                .build();

                BigDecimal total = BigDecimal.ZERO;
                List<CotizacionTrabajoModel> trabajosCotizados = new ArrayList<>();

                for (CotizacionTrabajoRequest t : request.getTrabajos()) {
                        SolicitudTrabajoModel solicitudTrabajo = solicitudTrabajoRepository
                                        .findById(t.getIdSolicitudTrabajo())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Trabajo de solicitud no encontrado con ID: "
                                                                        + t.getIdSolicitudTrabajo()));

                        CotizacionTrabajoModel cotTrabajo = CotizacionTrabajoModel.builder()
                                        .cotizacion(cotizacion)
                                        .solicitudTrabajo(solicitudTrabajo)
                                        .cantidad(t.getCantidad())
                                        .base(solicitudTrabajo.getBase())
                                        .altura(solicitudTrabajo.getAltura())
                                        .areaTotal(solicitudTrabajo.getAreaTotal())
                                        .costoUnitario(t.getCostoUnitario())
                                        .subtotal(t.getSubtotal())
                                        .build();

                        BigDecimal subtotalTrabajo = t.getSubtotal() != null ? t.getSubtotal() : BigDecimal.ZERO;
                        total = total.add(subtotalTrabajo);

                        List<DetalleCotizacionModel> detalles = new ArrayList<>();
                        for (DetalleCotizacionRequest m : t.getMateriales()) {
                                MaterialProduccionModel material = materialProduccionRepository
                                                .findById(m.getIdMaterial())
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Material no encontrado con ID: " + m.getIdMaterial()));

                                DetalleCotizacionModel detalle = DetalleCotizacionModel.builder()
                                                .cotizacionTrabajo(cotTrabajo)
                                                .material(material)
                                                .build();

                                detalles.add(detalle);
                        }
                        cotTrabajo.setDetalles(detalles);
                        trabajosCotizados.add(cotTrabajo);
                }

                cotizacion.setTrabajos(trabajosCotizados);

                cotizacion.setCostoTotal(total);
                cotizacionRepository.save(cotizacion);

                solicitud.setEstado(SolicitudCotizacion.COTIZADA);
                solicitudeCotizacionRepo.save(solicitud);

                return cotizacion;
        }

        @Override
        @Transactional(readOnly = true)
        public ConfirmacionPedidoDTO obtenerConfirmacionPedidoPorSolicitud(Long idSolicitud) {
                CotizacionModel cotizacion = cotizacionRepository.findBySolicitud_IdSolicitud(idSolicitud)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "No se encontró una cotización para la solicitud "
                                                                                + idSolicitud));

                SolicitudCotizacionModel solicitud = cotizacion.getSolicitud();
                ClienteModel cliente = solicitud.getCliente();

                String nombreCliente;
                if ("EMPRESA".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())
                                && cliente.getEmpresa() != null) {
                        nombreCliente = cliente.getEmpresa().getRazonSocial();
                } else if ("PERSONA".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())
                                && cliente.getPersona() != null) {
                        nombreCliente = cliente.getPersona().getName_people() + " " + cliente.getPersona().getAp() + " "
                                        + cliente.getPersona().getAm();
                } else {
                        nombreCliente = "Cliente desconocido";
                }

                ClienteDTO clienteDTO = ClienteDTO.builder()
                                .nombre(nombreCliente)
                                .tipoCliente(cliente.getTipoCliente())
                                .tipoClientePersonaEmpresa(cliente.getTipoClientePersonaEmpresa())
                                .correo(cliente.getCorreo())
                                .build();

                CotizacionInfoDTO cotizacionDTO = CotizacionInfoDTO.builder()
                                .idCotizacion(cotizacion.getIdCotizacion())
                                .codigo(cotizacion.getCodCotizacion())
                                .fechaEmision(cotizacion.getFechaEmision())
                                .fechaCaducidad(cotizacion.getFechaCaducado())
                                .costoTotal(cotizacion.getCostoTotal())
                                .build();

                List<TrabajoCotizadoDTO> trabajosDTO = cotizacion.getTrabajos().stream()
                                .map(ct -> TrabajoCotizadoDTO.builder()
                                                .nombre(ct.getSolicitudTrabajo().getTrabajo().getNombre())
                                                .cantidad(ct.getCantidad())
                                                .costoUnitario(ct.getCostoUnitario())
                                                .subtotal(ct.getSubtotal())
                                                .build())
                                .toList();

                return ConfirmacionPedidoDTO.builder()
                                .cliente(clienteDTO)
                                .cotizacion(cotizacionDTO)
                                .trabajos(trabajosDTO)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public Page<CotizacionModel> listarCotizaciones(Pageable pageable,
                        EstadoCotizacion estado,
                        String codCotizacion) {
                return cotizacionRepository.filtrarPorEstadoYCodigo(estado, codCotizacion, pageable);
        }

        @Override
        @Transactional(readOnly = true)
        public CotizacionDetalleDTO obtenerDetallePorId(Long id) {
                CotizacionModel cotizacion = cotizacionRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

                return convertirADetalleDTO(cotizacion);
        }

        private CotizacionDetalleDTO convertirADetalleDTO(CotizacionModel cotizacion) {
                return CotizacionDetalleDTO.builder()
                                .idCotizacion(cotizacion.getIdCotizacion())
                                .codCotizacion(cotizacion.getCodCotizacion())
                                .fechaEmision(cotizacion.getFechaEmision())
                                .fechaCaducado(cotizacion.getFechaCaducado())
                                .costoTotal(cotizacion.getCostoTotal())
                                .estado(cotizacion.getEstado().name())
                                .codSolicitud(cotizacion.getSolicitud().getCodSolicitud())
                                .clienteNombre(obtenerNombreCliente(cotizacion.getSolicitud().getCliente()))
                                .trabajos(cotizacion.getTrabajos().stream().map(this::convertirTrabajoDTO).toList())
                                .build();
        }

        private CotizacionTrabajoDTO convertirTrabajoDTO(CotizacionTrabajoModel trabajo) {
                return CotizacionTrabajoDTO.builder()
                                .idCotizacionTrabajo(trabajo.getIdCotizacionTrabajo())
                                .idSolicitudTrabajo(trabajo.getSolicitudTrabajo().getIdSolicitudTrabajo())
                                .idTrabajo(trabajo.getSolicitudTrabajo().getTrabajo().getIdTrabajo())
                                .nombreTrabajo(trabajo.getSolicitudTrabajo().getTrabajo().getNombre())
                                .cantidad(trabajo.getCantidad())
                                .costoUnitario(trabajo.getCostoUnitario())
                                .altura(trabajo.getAltura())
                                .base(trabajo.getBase())
                                .area_total(trabajo.getAreaTotal())
                                .subtotal(trabajo.getSubtotal())
                                .materiales(trabajo.getDetalles().stream()
                                                .map(this::convertirMaterialDTO)
                                                .toList())
                                .build();
        }

        private DetalleMaterialDTO convertirMaterialDTO(DetalleCotizacionModel detalle) {
                return DetalleMaterialDTO.builder()
                                .idDetalleCotizacion(detalle.getIdDetalleCotizacion())
                                .idMaterial(detalle.getMaterial().getIdMaterial())
                                .nombreMaterial(detalle.getMaterial().getNombre())
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

}
