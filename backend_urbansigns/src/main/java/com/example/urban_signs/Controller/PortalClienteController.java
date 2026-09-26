package com.example.urban_signs.Controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.urban_signs.DTO.Portal.PortalCotizacionItemResponse;
import com.example.urban_signs.DTO.Portal.PortalCotizacionResponse;
import com.example.urban_signs.DTO.Portal.PortalPedidoResponse;
import com.example.urban_signs.DTO.Portal.PortalPerfilResponse;
import com.example.urban_signs.DTO.Portal.PortalSolicitudRequest;
import com.example.urban_signs.DTO.Portal.PortalSolicitudTrabajoRequest;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.CotizacionTrabajoModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Model.SolicitudTrabajoModel;
import com.example.urban_signs.Model.TrabajosModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Repository.SolicitudCotizacionRepository;
import com.example.urban_signs.Repository.SolicitudTrabajoRepository;
import com.example.urban_signs.Repository.TrabajosRepository;
import com.example.urban_signs.ServicesImpl.CloudinaryService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.example.urban_signs.Utils.Enum.OrigenSolicitud;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final SolicitudTrabajoRepository solicitudTrabajoRepository;
    private final TrabajosRepository trabajosRepository;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;

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

    @PostMapping(value = "/solicitudes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Void> crearSolicitudMultipart(
            @RequestParam(value = "data", required = false) String dataJson,
            @RequestParam(value = "observaciones", required = false) String observacionesRaw,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        PortalSolicitudRequest request = null;
        if (dataJson != null && !dataJson.isBlank()) {
            try {
                request = objectMapper.readValue(dataJson, PortalSolicitudRequest.class);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de datos de solicitud inválido", e);
            }
        } else {
            request = new PortalSolicitudRequest(null, observacionesRaw, null);
        }
        return registrarSolicitudPortal(request, file, authentication);
    }

    @PostMapping(value = "/solicitudes", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<Void> crearSolicitudJson(
            @RequestBody PortalSolicitudRequest request,
            Authentication authentication) {
        return registrarSolicitudPortal(request, null, authentication);
    }

    private ResponseEntity<Void> registrarSolicitudPortal(PortalSolicitudRequest request, MultipartFile file, Authentication authentication) {
        ClienteModel cliente = obtenerCliente(authentication);

        String observaciones = request != null && request.observaciones() != null ? request.observaciones().trim() : "";
        String titulo = request != null && request.titulo() != null ? request.titulo().trim() : "";

        String textoObservaciones = observaciones;
        if (!titulo.isBlank() && !textoObservaciones.contains(titulo)) {
            textoObservaciones = titulo + (!textoObservaciones.isBlank() ? ("\n" + textoObservaciones) : "");
        }

        if (textoObservaciones.isBlank() && (request == null || request.trabajos() == null || request.trabajos().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción o los trabajos de la solicitud son obligatorios");
        }

        String archivoUrl = null;
        if (file != null && !file.isEmpty()) {
            archivoUrl = cloudinaryService.uploadFile(file, CloudinaryFolder.REFERENCIAS_SOLICITUD);
        }

        LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

        SolicitudCotizacionModel solicitud = SolicitudCotizacionModel.builder()
                .codSolicitud(generarCodigoSolicitud())
                .cliente(cliente)
                .fechaSolicitud(fechaActualLaPaz)
                .estado(SolicitudCotizacion.PENDIENTE)
                .origen(OrigenSolicitud.LANDING)
                .archivoReferencia(archivoUrl)
                .observaciones(textoObservaciones)
                .build();
        solicitud = solicitudRepository.save(solicitud);

        // Guardar trabajos en solicitud_trabajo para que aparezcan en el dashboard con medidas completas
        if (request != null && request.trabajos() != null && !request.trabajos().isEmpty()) {
            List<SolicitudTrabajoModel> trabajosGuardar = new ArrayList<>();
            for (PortalSolicitudTrabajoRequest item : request.trabajos()) {
                TrabajosModel trabajo = null;
                if (item.idTrabajo() != null) {
                    trabajo = trabajosRepository.findById(item.idTrabajo()).orElse(null);
                }
                if (trabajo == null && item.servicio() != null && !item.servicio().isBlank()) {
                    trabajo = trabajosRepository.findFirstByNombreIgnoreCase(item.servicio().trim())
                            .or(() -> trabajosRepository.findFirstByNombreContainingIgnoreCase(item.servicio().trim()))
                            .orElse(null);
                }
                if (trabajo == null) {
                    List<TrabajosModel> activos = trabajosRepository.findByEstadoTrueOrderByIdTrabajoAsc();
                    if (!activos.isEmpty()) {
                        trabajo = activos.get(0);
                    } else {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay servicios o trabajos disponibles en el catálogo");
                    }
                }

                int cantidad = (item.cantidad() != null && item.cantidad() > 0) ? item.cantidad() : 1;
                BigDecimal base = item.base() != null ? item.base() : BigDecimal.ZERO;
                BigDecimal altura = item.altura() != null ? item.altura() : BigDecimal.ZERO;
                BigDecimal areaTotal = (base != null && altura != null) ? base.multiply(altura) : BigDecimal.ZERO;

                String desc = item.descripcion() != null ? item.descripcion().trim() : "";
                if (desc.isBlank() && !titulo.isBlank()) {
                    desc = titulo;
                }

                SolicitudTrabajoModel nuevoTrabajo = SolicitudTrabajoModel.builder()
                        .solicitud(solicitud)
                        .trabajo(trabajo)
                        .cantidad(cantidad)
                        .base(base)
                        .altura(altura)
                        .areaTotal(areaTotal)
                        .descripcion(desc)
                        .build();

                trabajosGuardar.add(nuevoTrabajo);
            }

            solicitudTrabajoRepository.saveAll(trabajosGuardar);
        } else if (!textoObservaciones.isBlank()) {
            // Retrocompatibilidad: asegurar que siempre exista al menos 1 trabajo asociado en el dashboard
            String servicioNombre = extraerServicio(textoObservaciones, null);
            TrabajosModel trabajo = null;
            if (servicioNombre != null) {
                trabajo = trabajosRepository.findFirstByNombreIgnoreCase(servicioNombre)
                        .or(() -> trabajosRepository.findFirstByNombreContainingIgnoreCase(servicioNombre))
                        .orElse(null);
            }
            if (trabajo == null) {
                List<TrabajosModel> activos = trabajosRepository.findByEstadoTrueOrderByIdTrabajoAsc();
                if (!activos.isEmpty()) {
                    trabajo = activos.get(0);
                }
            }
            if (trabajo != null) {
                SolicitudTrabajoModel itemDefecto = SolicitudTrabajoModel.builder()
                        .solicitud(solicitud)
                        .trabajo(trabajo)
                        .cantidad(1)
                        .base(BigDecimal.ZERO)
                        .altura(BigDecimal.ZERO)
                        .areaTotal(BigDecimal.ZERO)
                        .descripcion(titulo.isBlank() ? "Solicitud registrada desde la web" : titulo)
                        .build();
                solicitudTrabajoRepository.save(itemDefecto);
            }
        }

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
        String ref = cotizacion.getSolicitud() != null ? cotizacion.getSolicitud().getArchivoReferencia() : null;
        String titulo = extraerTitulo(obs, "Cotización " + cotizacion.getCodCotizacion());

        List<PortalCotizacionItemResponse> items = new ArrayList<>();
        if (cotizacion.getTrabajos() != null && !cotizacion.getTrabajos().isEmpty()) {
            for (CotizacionTrabajoModel ct : cotizacion.getTrabajos()) {
                String serv = "Servicio cotizado";
                String desc = null;
                if (ct.getSolicitudTrabajo() != null) {
                    if (ct.getSolicitudTrabajo().getTrabajo() != null) {
                        serv = ct.getSolicitudTrabajo().getTrabajo().getNombre();
                    }
                    desc = ct.getSolicitudTrabajo().getDescripcion();
                }
                BigDecimal base = ct.getBase() != null ? ct.getBase()
                        : (ct.getSolicitudTrabajo() != null ? ct.getSolicitudTrabajo().getBase() : null);
                BigDecimal altura = ct.getAltura() != null ? ct.getAltura()
                        : (ct.getSolicitudTrabajo() != null ? ct.getSolicitudTrabajo().getAltura() : null);
                BigDecimal area = ct.getAreaTotal() != null ? ct.getAreaTotal()
                        : (ct.getSolicitudTrabajo() != null ? ct.getSolicitudTrabajo().getAreaTotal() : null);
                Integer cant = ct.getCantidad() != null ? ct.getCantidad()
                        : (ct.getSolicitudTrabajo() != null ? ct.getSolicitudTrabajo().getCantidad() : 1);

                items.add(new PortalCotizacionItemResponse(
                        ct.getIdCotizacionTrabajo(),
                        serv,
                        desc,
                        cant,
                        base,
                        altura,
                        area,
                        ct.getCostoUnitario(),
                        ct.getSubtotal()));
            }
        } else if (cotizacion.getSolicitud() != null && cotizacion.getSolicitud().getIdSolicitud() != null) {
            List<SolicitudTrabajoModel> solicitudTrabajos = solicitudTrabajoRepository
                    .findBySolicitudId(cotizacion.getSolicitud().getIdSolicitud());
            for (SolicitudTrabajoModel st : solicitudTrabajos) {
                items.add(new PortalCotizacionItemResponse(
                        st.getIdSolicitudTrabajo(),
                        st.getTrabajo() != null ? st.getTrabajo().getNombre() : "Servicio solicitado",
                        st.getDescripcion(),
                        st.getCantidad() != null ? st.getCantidad() : 1,
                        st.getBase(),
                        st.getAltura(),
                        st.getAreaTotal(),
                        null,
                        null));
            }
        }

        String primerServicio = !items.isEmpty() ? items.get(0).servicio() : null;
        String servicio = primerServicio != null ? primerServicio : extraerServicio(obs, "Servicio cotizado");

        return new PortalCotizacionResponse(
                cotizacion.getIdCotizacion(),
                cotizacion.getCodCotizacion(),
                titulo,
                servicio,
                obs,
                cotizacion.getFechaEmision(),
                cotizacion.getFechaCaducado(),
                switch (cotizacion.getEstado()) {
                    case PENDIENTE -> "quoted";
                    case APROBADA -> "accepted";
                    case CADUCADA -> "rejected";
                },
                cotizacion.getCostoTotal(),
                ref,
                items);
    }

    private PortalCotizacionResponse mapearSolicitud(SolicitudCotizacionModel solicitud) {
        String obs = solicitud.getObservaciones() != null ? solicitud.getObservaciones() : "";
        String titulo = extraerTitulo(obs, "Solicitud " + solicitud.getCodSolicitud());

        List<PortalCotizacionItemResponse> items = new ArrayList<>();
        if (solicitud.getIdSolicitud() != null) {
            List<SolicitudTrabajoModel> solicitudTrabajos = solicitudTrabajoRepository
                    .findBySolicitudId(solicitud.getIdSolicitud());
            for (SolicitudTrabajoModel st : solicitudTrabajos) {
                items.add(new PortalCotizacionItemResponse(
                        st.getIdSolicitudTrabajo(),
                        st.getTrabajo() != null ? st.getTrabajo().getNombre() : "Servicio solicitado",
                        st.getDescripcion(),
                        st.getCantidad() != null ? st.getCantidad() : 1,
                        st.getBase(),
                        st.getAltura(),
                        st.getAreaTotal(),
                        null,
                        null));
            }
        }

        String primerServicio = !items.isEmpty() ? items.get(0).servicio() : null;
        String servicio = primerServicio != null ? primerServicio : extraerServicio(obs, "Servicio solicitado");
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
                null,
                solicitud.getArchivoReferencia(),
                items);
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
