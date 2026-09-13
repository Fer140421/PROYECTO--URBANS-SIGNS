package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Facturacion.FacturacionRequestDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoListDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoResumenDTO;
import com.example.urban_signs.DTO.Pedidos.completarPedido.CompletarPedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.CotizacionDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.CotizacionTrabajoDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.DetalleCotizacionDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.PedidoCotizacionDTO;
import com.example.urban_signs.DTO.Pedidos.entrega.PedidoListoEntregaDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Model.PagoPedidoModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.EmployeeRepository;
import com.example.urban_signs.Repository.PagosPedidoRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Services.PedidosService;
import com.example.urban_signs.ServicesImpl.CloudinaryService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.example.urban_signs.Utils.Enum.EstadoPago;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoiServiceImpl implements PedidosService {

        private final CotizacionRepository cotizacionRepository;
        private final PedidosRepository pedidoRepository;
        private final PagosPedidoRepository pagoPedidoRepository;
        private final FacturacionService facturacionService;
        private final EmployeeRepository employeeRepository;
        private final CloudinaryService cloudinaryService;

        @Override
        @Transactional
        public PedidoModel generarPedidoDesdeCotizacion(PedidoRequestDTO request) {

                CotizacionModel cotizacion = cotizacionRepository.findById(request.getIdCotizacion())
                                .orElseThrow(() -> new RuntimeException("Cotización no encontrada"));
                cotizacion.setEstado(EstadoCotizacion.APROBADA);
                cotizacionRepository.save(cotizacion);

                BigDecimal total = cotizacion.getCostoTotal();
                BigDecimal anticipo = request.getAnticipo() != null ? request.getAnticipo()
                                : total.multiply(new BigDecimal("0.5"));
                BigDecimal saldo = total.subtract(anticipo);

                // Determinar estado de pago inicial
                EstadoPago estadoPago;
                if (anticipo.compareTo(BigDecimal.ZERO) == 0) {
                        estadoPago = EstadoPago.SIN_PAGAR;
                } else if (anticipo.compareTo(total) >= 0) {
                        estadoPago = EstadoPago.PAGADO_COMPLETO;
                        saldo = BigDecimal.ZERO;
                } else {
                        estadoPago = EstadoPago.ANTICIPO_PAGADO;
                }

                LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

                PedidoModel pedido = PedidoModel.builder()
                                .cotizacion(cotizacion)
                                .cliente(cotizacion.getSolicitud().getCliente())
                                .total(total)
                                .anticipo(anticipo)
                                .fechaPedido(fechaActualLaPaz)
                                .saldoPendiente(saldo)
                                .estadoPedido(EstadoPedido.EN_PROCESO)
                                .estadoPago(estadoPago)
                                .build();

                PedidoModel pedidoGuardado = pedidoRepository.save(pedido);

                // Solo registrar pago si hay anticipo
                if (anticipo.compareTo(BigDecimal.ZERO) > 0) {
                        PagoPedidoModel pago = PagoPedidoModel.builder()
                                        .pedido(pedidoGuardado)
                                        .monto(anticipo)
                                        .metodoPago(request.getMetodoPago())
                                        .observacion(request.getObservacion())
                                        .build();

                        pagoPedidoRepository.save(pago);
                }

                return pedidoGuardado;
        }

        @Override
        public Page<PedidoListDTO> listarPedidos(Pageable pageable, EstadoPedido estado) {

                Page<PedidoModel> pedidos;

                if (estado != null) {
                        pedidos = pedidoRepository.findByEstadoPedido(estado, pageable);
                } else {
                        pedidos = pedidoRepository.findAll(pageable);
                }

                return pedidos.map(p -> {
                        ClienteModel cliente = p.getCliente();
                        String nombreCliente = "Sin nombre";

                        if (cliente.getPersona() != null) {
                                PeopleModel person = cliente.getPersona();
                                nombreCliente = person.getName_people() + " " +
                                                (person.getAp() != null ? person.getAp() : "") + " " +
                                                (person.getAm() != null ? person.getAm() : "");
                        } else if (cliente.getEmpresa() != null) {
                                nombreCliente = cliente.getEmpresa().getRazonSocial();
                        }

                        return new PedidoListDTO(
                                        p.getIdPedido(),
                                        cliente.getIdCliente(),
                                        p.getCotizacion().getIdCotizacion(),
                                        p.getCotizacion().getCodCotizacion(),
                                        nombreCliente,
                                        p.getFechaPedido(),
                                        p.getEstadoPedido(),
                                        p.getEstadoPago(),
                                        p.getAnticipo(),
                                        p.getSaldoPendiente(),
                                        p.getTotal());
                });
        }

        @Override
        @Transactional(readOnly = true)
        public PedidoCotizacionDTO obtenerDetallePedido(Long idPedido) {
                PedidoModel pedido = pedidoRepository.findById(idPedido)
                                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

                // Crear DTO para pedido
                PedidoCotizacionDTO dto = new PedidoCotizacionDTO();
                dto.setIdPedido(pedido.getIdPedido());
                dto.setEstadoPedido(pedido.getEstadoPedido()); // ENUM
                dto.setEstadoPago(pedido.getEstadoPago()); // ENUM NUEVO
                dto.setFechaPedido(pedido.getFechaPedido());
                dto.setAnticipo(pedido.getAnticipo());
                dto.setSaldoPendiente(pedido.getSaldoPendiente());
                dto.setTotalPedido(pedido.getTotal());

                // Obtener la cotización asociada al pedido
                CotizacionModel cotizacion = pedido.getCotizacion();

                // Crear DTO para cotización
                CotizacionDTO cotizacionDTO = new CotizacionDTO();
                cotizacionDTO.setIdCotizacion(cotizacion.getIdCotizacion());
                cotizacionDTO.setCodCotizacion(cotizacion.getCodCotizacion());
                cotizacionDTO.setFechaEmision(cotizacion.getFechaEmision());
                cotizacionDTO.setEstado(cotizacion.getEstado());
                cotizacionDTO.setCostoTotal(cotizacion.getCostoTotal());

                // Obtener detalles de cotización (trabajos)
                List<CotizacionTrabajoDTO> trabajosDTO = cotizacion.getTrabajos().stream()
                                .map(trabajo -> {
                                        CotizacionTrabajoDTO trabajoDTO = new CotizacionTrabajoDTO();
                                        trabajoDTO.setIdCotizacionTrabajo(trabajo.getIdCotizacionTrabajo());
                                        trabajoDTO.setSubtotal(trabajo.getSubtotal());

                                        // Obtener detalles de cotización (detalles)
                                        List<DetalleCotizacionDTO> detallesDTO = trabajo.getDetalles().stream()
                                                        .map(detalle -> {
                                                                DetalleCotizacionDTO detalleDTO = new DetalleCotizacionDTO();
                                                                detalleDTO.setIdDetalleCotizacion(
                                                                                detalle.getIdDetalleCotizacion());
                                                                detalleDTO.setIdMaterial(
                                                                                detalle.getMaterial().getIdMaterial());
                                                                detalleDTO.setNombreMaterial(
                                                                                detalle.getMaterial().getNombre());
                                                                return detalleDTO;
                                                        })
                                                        .collect(Collectors.toList());

                                        trabajoDTO.setDetalles(detallesDTO);
                                        return trabajoDTO;
                                }).collect(Collectors.toList());

                cotizacionDTO.setTrabajos(trabajosDTO);

                // Asignar cotización al DTO de pedido
                dto.setCotizacion(cotizacionDTO);

                return dto;

        }

        @Override
        @Transactional
        public PedidoModel completarPedido(Long idPedido, CompletarPedidoRequestDTO request) {
                PedidoModel pedido = pedidoRepository.findById(idPedido)
                                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + idPedido));

                // --- Validaciones (Igual que antes) ---
                if (pedido.getEstadoPedido() == EstadoPedido.ENTREGADO) {
                        throw new RuntimeException("El pedido ya está marcado como ENTREGADO");
                }
                if (pedido.getEstadoPedido() == EstadoPedido.CANCELADO) {
                        throw new RuntimeException("No se puede completar un pedido CANCELADO");
                }

                // --- Lógica de Pagos (Igual que antes) ---
                if (request.getPagoFinal() != null && request.getPagoFinal().getMonto() != null &&
                                request.getPagoFinal().getMonto().compareTo(BigDecimal.ZERO) > 0) {

                        BigDecimal montoPago = request.getPagoFinal().getMonto();

                        if (montoPago.compareTo(pedido.getSaldoPendiente()) > 0) {
                                throw new RuntimeException("El monto del pago excede el saldo pendiente.");
                        }

                        LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

                        PagoPedidoModel pago = PagoPedidoModel.builder()
                                        .pedido(pedido)
                                        .monto(montoPago)
                                        .metodoPago(request.getPagoFinal().getMetodoPago())
                                        .observacion(request.getPagoFinal().getObservacion())
                                        .fechaPago(fechaActualLaPaz)
                                        .build();

                        pagoPedidoRepository.save(pago);

                        BigDecimal nuevoAnticipo = pedido.getAnticipo().add(montoPago);
                        BigDecimal nuevoSaldo = pedido.getTotal().subtract(nuevoAnticipo);
                        pedido.setAnticipo(nuevoAnticipo);
                        pedido.setSaldoPendiente(nuevoSaldo);

                        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
                                pedido.setEstadoPago(EstadoPago.PAGADO_COMPLETO);
                                pedido.setSaldoPendiente(BigDecimal.ZERO);
                        } else {
                                pedido.setEstadoPago(EstadoPago.ANTICIPO_PAGADO);
                        }
                }

                // --- Datos de entrega física y evidencia ---
                pedido.setFechaEntregaReal(LocalDateTime.now(ZoneId.of("America/La_Paz")));
                if (request.getFotoEvidencia() != null && !request.getFotoEvidencia().isBlank()) {
                        pedido.setFotoEvidencia(request.getFotoEvidencia());
                }
                if (request.getObservacionEntrega() != null) {
                        pedido.setObservacionEntrega(request.getObservacionEntrega());
                }
                if (request.getLatitud() != null) {
                        pedido.setLatitudEntrega(request.getLatitud());
                }
                if (request.getLongitud() != null) {
                        pedido.setLongitudEntrega(request.getLongitud());
                }
                if (request.getIdEmpleado() != null) {
                        employeeRepository.findById(request.getIdEmpleado()).ifPresent(pedido::setEntregadoPor);
                }

                pedido.setEstadoPedido(EstadoPedido.ENTREGADO);
                PedidoModel pedidoActualizado = pedidoRepository.saveAndFlush(pedido);

                try {
                        System.out.println("Iniciando facturación para pedido: " + pedidoActualizado.getIdPedido());
                        facturacionService.emitirFactura(pedidoActualizado.getIdPedido());

                } catch (Exception e) {
                        System.err.println("Error al emitir factura automática: " + e.getMessage());
                        e.printStackTrace();
                }

                return pedidoActualizado;
        }

        @Override
        @Transactional(readOnly = true)
        public List<PedidoResumenDTO> obtenerPedidosPendientes() {
                return pedidoRepository.findByEstadoPedidoIn(
                                List.of(
                                                EstadoPedido.PENDIENTE,
                                                EstadoPedido.EN_PROCESO,
                                                EstadoPedido.EN_TALLER))
                                .stream()
                                .map(this::convertirAPedidoResumenDTO)
                                .collect(Collectors.toList());
        }

        private PedidoResumenDTO convertirAPedidoResumenDTO(PedidoModel pedido) {
                PedidoResumenDTO dto = new PedidoResumenDTO();
                dto.setIdPedido(pedido.getIdPedido());
                ClienteModel cliente = pedido.getCliente();
                String nombreCliente;
                if ("Persona".equals(cliente.getTipoClientePersonaEmpresa())) {
                        PeopleModel persona = cliente.getPersona();
                        nombreCliente = String.format("%s %s %s",
                                        persona.getName_people(),
                                        persona.getAp() != null ? persona.getAp() : "",
                                        persona.getAm() != null ? persona.getAm() : "").trim();
                } else {
                        nombreCliente = cliente.getEmpresa().getRazonSocial();
                }

                dto.setCliente(nombreCliente);
                dto.setFechaPedido(pedido.getFechaPedido());
                dto.setTotal(pedido.getTotal());
                dto.setEstadoPedido(pedido.getEstadoPedido());
                dto.setEstadoPago(pedido.getEstadoPago());

                return dto;
        }

        @Override
        @Transactional(readOnly = true)
        public List<PedidoListoEntregaDTO> obtenerPedidosListosParaEntrega() {
                List<PedidoModel> pedidos = pedidoRepository.findByEstadoPedidoOrderByFechaPedidoDesc(EstadoPedido.FINALIZADO);

                return pedidos.stream().map(p -> {
                        ClienteModel cliente = p.getCliente();
                        String nombreCliente = "Sin nombre";
                        String telefono = "";
                        String direccion = "";

                        if (cliente.getPersona() != null) {
                                PeopleModel person = cliente.getPersona();
                                nombreCliente = (person.getName_people() + " " +
                                                (person.getAp() != null ? person.getAp() : "") + " " +
                                                (person.getAm() != null ? person.getAm() : "")).trim();
                                telefono = person.getPhone_number() != null ? person.getPhone_number() : "";
                                direccion = person.getAddres() != null ? person.getAddres() : "";
                        } else if (cliente.getEmpresa() != null) {
                                nombreCliente = cliente.getEmpresa().getRazonSocial();
                                telefono = cliente.getEmpresa().getTelefono() != null ? cliente.getEmpresa().getTelefono() : "";
                                direccion = cliente.getEmpresa().getDireccion() != null ? cliente.getEmpresa().getDireccion() : "";
                        }

                        List<String> trabajosDesc = List.of();
                        if (p.getCotizacion() != null && p.getCotizacion().getTrabajos() != null) {
                                trabajosDesc = p.getCotizacion().getTrabajos().stream()
                                                .map(t -> t.getSolicitudTrabajo() != null && t.getSolicitudTrabajo().getTrabajo() != null
                                                                ? t.getSolicitudTrabajo().getTrabajo().getNombre() + " (Cant: " + t.getCantidad() + ")"
                                                                : "Trabajo #" + t.getIdCotizacionTrabajo())
                                                .collect(Collectors.toList());
                        }

                        return PedidoListoEntregaDTO.builder()
                                        .idPedido(p.getIdPedido())
                                        .idCotizacion(p.getCotizacion() != null ? p.getCotizacion().getIdCotizacion() : null)
                                        .codCotizacion(p.getCotizacion() != null ? p.getCotizacion().getCodCotizacion() : "")
                                        .nombreCliente(nombreCliente)
                                        .telefonoCliente(telefono)
                                        .direccionCliente(direccion)
                                        .fechaPedido(p.getFechaPedido())
                                        .estadoPedido(p.getEstadoPedido().name())
                                        .estadoPago(p.getEstadoPago().name())
                                        .total(p.getTotal())
                                        .anticipo(p.getAnticipo())
                                        .saldoPendiente(p.getSaldoPendiente())
                                        .descripcionTrabajos(trabajosDesc)
                                        .build();
                }).collect(Collectors.toList());
        }

        @Override
        @Transactional
        public PedidoModel registrarEntregaConFoto(Long idPedido,
                                                MultipartFile foto,
                                                Long idEmpleado,
                                                BigDecimal monto,
                                                String metodoPago,
                                                String observacion,
                                                BigDecimal latitud,
                                                BigDecimal longitud) {
                String fotoUrl = null;
                if (foto != null && !foto.isEmpty()) {
                        try {
                                fotoUrl = cloudinaryService.uploadFile(foto, CloudinaryFolder.EVIDENCIAS_ENTREGA);
                        } catch (Exception e) {
                                throw new RuntimeException("Error al subir foto de evidencia a Cloudinary: " + e.getMessage(), e);
                        }
                }

                CompletarPedidoRequestDTO dto = new CompletarPedidoRequestDTO();
                dto.setIdEmpleado(idEmpleado);
                dto.setObservacionEntrega(observacion);
                dto.setFotoEvidencia(fotoUrl);
                dto.setLatitud(latitud);
                dto.setLongitud(longitud);

                if (monto != null && monto.compareTo(BigDecimal.ZERO) > 0) {
                        dto.setPagoFinal(new CompletarPedidoRequestDTO.PagoFinalDTO(
                                monto,
                                metodoPago != null ? metodoPago : "EFECTIVO",
                                "Pago final al momento de la entrega"
                        ));
                }

                return completarPedido(idPedido, dto);
        }
}
