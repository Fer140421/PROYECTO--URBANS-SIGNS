package com.example.urban_signs.Controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.urban_signs.DTO.Portal.PortalCotizacionResponse;
import com.example.urban_signs.DTO.Portal.PortalPedidoResponse;
import com.example.urban_signs.DTO.Portal.PortalPerfilResponse;
import com.example.urban_signs.DTO.Portal.PortalSolicitudRequest;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Repository.SolicitudCotizacionRepository;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/portal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Cliente')")
public class PortalClienteController {

    private final ClienteRepository clienteRepository;
    private final CotizacionRepository cotizacionRepository;
    private final PedidosRepository pedidosRepository;
    private final SolicitudCotizacionRepository solicitudRepository;

    /** Devuelve únicamente el perfil vinculado al usuario autenticado. */
    @GetMapping("/me")
    public ResponseEntity<PortalPerfilResponse> obtenerMiPerfil(Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);
        return ResponseEntity.ok(mapearPerfil(cliente, authentication.getName()));
    }

    @GetMapping("/cotizaciones")
    @Transactional(readOnly = true)
    public List<PortalCotizacionResponse> listarMisCotizaciones(Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);
        List<CotizacionModel> cotizaciones = cotizacionRepository
                .findBySolicitud_Cliente_IdClienteOrderByFechaEmisionDesc(cliente.getIdCliente());

        Set<Long> solicitudesConCotizacion = cotizaciones.stream()
                .filter(c -> c.getSolicitud() != null && c.getSolicitud().getIdSolicitud() != null)
                .map(c -> c.getSolicitud().getIdSolicitud())
                .collect(Collectors.toSet());

        List<SolicitudCotizacionModel> solicitudes = solicitudRepository
                .findByCliente_IdClienteOrderByFechaSolicitudDesc(cliente.getIdCliente());

        List<PortalCotizacionResponse> respuestas = new ArrayList<>();

        for (CotizacionModel cotizacion : cotizaciones) {
            respuestas.add(mapearCotizacion(cotizacion));
        }

        for (SolicitudCotizacionModel solicitud : solicitudes) {
            if (!solicitudesConCotizacion.contains(solicitud.getIdSolicitud())) {
                respuestas.add(mapearSolicitud(solicitud));
            }
        }

        return respuestas;
    }

    @GetMapping("/cotizaciones/{id}")
    @Transactional(readOnly = true)
    public PortalCotizacionResponse obtenerMiCotizacion(@PathVariable Long id, Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);
        return cotizacionRepository.findByIdCotizacionAndSolicitud_Cliente_IdCliente(id, cliente.getIdCliente())
                .map(this::mapearCotizacion)
                .or(() -> solicitudRepository.findById(id)
                        .filter(s -> s.getCliente() != null && s.getCliente().getIdCliente().equals(cliente.getIdCliente()))
                        .map(this::mapearSolicitud))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cotización no encontrada"));
    }

    @PostMapping("/cotizaciones/{id}/aceptar")
    @Transactional
    public ResponseEntity<Void> aceptarCotizacion(@PathVariable Long id, Authentication authentication) {
        CotizacionModel cotizacion = obtenerCotizacionPropia(id, authentication);
        if (cotizacion.getEstado() != EstadoCotizacion.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cotización ya no puede aceptarse");
        }
        cotizacion.setEstado(EstadoCotizacion.APROBADA);
        cotizacionRepository.save(cotizacion);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cotizaciones/{id}/rechazar")
    @Transactional
    public ResponseEntity<Void> rechazarCotizacion(@PathVariable Long id, Authentication authentication) {
        CotizacionModel cotizacion = obtenerCotizacionPropia(id, authentication);
        if (cotizacion.getEstado() != EstadoCotizacion.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cotización ya no puede rechazarse");
        }
        // El esquema actual no tiene estado RECHAZADA; CADUCADA representa una cotización no aceptada.
        cotizacion.setEstado(EstadoCotizacion.CADUCADA);
        cotizacionRepository.save(cotizacion);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pedidos")
    @Transactional(readOnly = true)
    public List<PortalPedidoResponse> listarMisPedidos(Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);
        return pedidosRepository.findByCliente_IdClienteOrderByFechaPedidoDesc(cliente.getIdCliente())
                .stream().map(this::mapearPedido).toList();
    }

    @GetMapping("/pedidos/{id}")
    @Transactional(readOnly = true)
    public PortalPedidoResponse obtenerMiPedido(@PathVariable Long id, Authentication authentication) {
        return pedidosRepository.findByIdPedidoAndCliente_IdCliente(id, obtenerCliente(authentication).getIdCliente())
                .map(this::mapearPedido)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    }

    @PostMapping("/solicitudes")
    @Transactional
    public ResponseEntity<Void> crearSolicitud(@RequestBody PortalSolicitudRequest request, Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);
        String observaciones = request.observaciones() == null ? "" : request.observaciones().trim();
        if (observaciones.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción de la solicitud es obligatoria");
        }

        SolicitudCotizacionModel solicitud = SolicitudCotizacionModel.builder()
                .codSolicitud(generarCodigoSolicitud())
                .cliente(cliente)
                .fechaSolicitud(LocalDate.now())
                .estado(SolicitudCotizacion.PENDIENTE)
                .observaciones(observaciones)
                .build();
        solicitudRepository.save(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private ClienteModel obtenerCliente(Authentication authentication) {
        return clienteRepository.findByUsuario_UserAcces(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "La cuenta no está vinculada a un cliente del portal"));
    }

    private CotizacionModel obtenerCotizacionPropia(Long id, Authentication authentication) {
        return cotizacionRepository.findByIdCotizacionAndSolicitud_Cliente_IdCliente(id, obtenerCliente(authentication).getIdCliente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cotización no encontrada"));
    }

    private String generarCodigoSolicitud() {
        String codigo;
        do {
            codigo = "PORTAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (solicitudRepository.existsByCodSolicitud(codigo));
        return codigo;
    }

    private PortalPerfilResponse mapearPerfil(ClienteModel cliente, String correoCuenta) {
        boolean esPersona = "Persona".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa());
        String nombre = esPersona ? unirNombre(cliente) : cliente.getEmpresa().getRazonSocial();
        String telefono = esPersona ? cliente.getPersona().getPhone_number() : cliente.getEmpresa().getTelefono();
        return new PortalPerfilResponse(cliente.getIdCliente(), cliente.getTipoClientePersonaEmpresa(), nombre,
                cliente.getCorreo() == null || cliente.getCorreo().isBlank() ? correoCuenta : cliente.getCorreo(), telefono);
    }

    private PortalCotizacionResponse mapearCotizacion(CotizacionModel cotizacion) {
        String obs = cotizacion.getSolicitud() != null ? cotizacion.getSolicitud().getObservaciones() : "";
        String titulo = extraerTitulo(obs, "Cotización " + cotizacion.getCodCotizacion());
        String servicio = extraerServicio(obs, "Servicio cotizado");
        return new PortalCotizacionResponse(cotizacion.getIdCotizacion(), cotizacion.getCodCotizacion(),
                titulo, servicio,
                obs, cotizacion.getFechaEmision(), cotizacion.getFechaCaducado(),
                switch (cotizacion.getEstado()) {
                    case PENDIENTE -> "quoted";
                    case APROBADA -> "accepted";
                    case CADUCADA -> "rejected";
                }, cotizacion.getCostoTotal());
    }

    private PortalCotizacionResponse mapearSolicitud(SolicitudCotizacionModel solicitud) {
        String obs = solicitud.getObservaciones() != null ? solicitud.getObservaciones() : "";
        String titulo = extraerTitulo(obs, "Solicitud " + solicitud.getCodSolicitud());
        String servicio = extraerServicio(obs, "Servicio solicitado");
        String estado = switch (solicitud.getEstado()) {
            case CANCELADA -> "rejected";
            case COTIZADA -> "quoted";
            default -> "review";
        };
        return new PortalCotizacionResponse(
                solicitud.getIdSolicitud(),
                solicitud.getCodSolicitud(),
                titulo,
                servicio,
                obs,
                solicitud.getFechaSolicitud(),
                null,
                estado,
                null
        );
    }

    private String extraerTitulo(String observaciones, String defecto) {
        if (observaciones == null || observaciones.isBlank()) return defecto;
        String primeraLinea = observaciones.split("\\r?\\n")[0].trim();
        return primeraLinea.isBlank() ? defecto : primeraLinea;
    }

    private String extraerServicio(String observaciones, String defecto) {
        if (observaciones == null || observaciones.isBlank()) return defecto;
        for (String linea : observaciones.split("\\r?\\n")) {
            String trimmed = linea.trim();
            if (trimmed.toLowerCase().startsWith("servicio solicitado:")) {
                String s = trimmed.substring("servicio solicitado:".length()).trim();
                if (s.endsWith(".")) s = s.substring(0, s.length() - 1).trim();
                if (!s.isBlank()) return s;
            }
        }
        return defecto;
    }

    private PortalPedidoResponse mapearPedido(PedidoModel pedido) {
        return new PortalPedidoResponse(pedido.getIdPedido(), "PED-" + pedido.getIdPedido(),
                pedido.getCotizacion().getCodCotizacion(), "Pedido " + pedido.getCotizacion().getCodCotizacion(),
                "Servicio cotizado", mapearEstadoPedido(pedido.getEstadoPedido()), progresoPedido(pedido.getEstadoPedido()),
                pedido.getTotal(), pedido.getFechaPedido(), pedido.getFechaPedido());
    }

    private String mapearEstadoPedido(EstadoPedido estado) {
        return switch (estado) {
            case PENDIENTE -> "approval";
            case EN_PROCESO, EN_TALLER -> "production";
            case FINALIZADO -> "ready";
            case ENTREGADO -> "completed";
            case CANCELADO -> "completed";
        };
    }

    private int progresoPedido(EstadoPedido estado) {
        return switch (estado) {
            case PENDIENTE -> 10;
            case EN_PROCESO -> 35;
            case EN_TALLER -> 65;
            case FINALIZADO -> 90;
            case ENTREGADO -> 100;
            case CANCELADO -> 0;
        };
    }

    private String unirNombre(ClienteModel cliente) {
        return String.join(" ", textoSeguro(cliente.getPersona().getName_people()),
                textoSeguro(cliente.getPersona().getAp()), textoSeguro(cliente.getPersona().getAm()))
                .trim().replaceAll("\\s+", " ");
    }

    private String textoSeguro(String valor) {
        return valor == null ? "" : valor;
    }
}
