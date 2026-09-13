package com.example.urban_signs.ServicesImpl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.urban_signs.DTO.SeguimientoPedido.CrearTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.PlanificacionSemanalDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.ReprogramarTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoDisponibleDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoProgramadoDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionTrabajoModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Model.PlanificacionSemanalModel;
import com.example.urban_signs.Model.ReprogramacionTrabajoModel;
import com.example.urban_signs.Model.SolicitudTrabajoModel;
import com.example.urban_signs.Model.TrabajoProgramadoModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.CotizacionTrabajoRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Repository.PlanificacionSemanalRepository;
import com.example.urban_signs.Repository.ReprogramacionTrabajoRepository;
import com.example.urban_signs.Repository.TrabajoProgramadoRepository;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Repository.EmployeeRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.PlanificacionSemanalService;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
import com.example.urban_signs.Utils.Enum.EstadoTrabajoProgramado;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlanificacionSemanalServiceImpl implements PlanificacionSemanalService {
    private final PlanificacionSemanalRepository planificacionRepository;
    private final TrabajoProgramadoRepository trabajoRepository;
    private final ReprogramacionTrabajoRepository reprogramacionRepository;
    private final UsersRepository userRepository;
    private final PedidosRepository pedidoRepository;
    private final CotizacionTrabajoRepository cotizacionTrabajoRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public PlanificacionSemanalDTO crearPlanificacionSemanal(LocalDate fechaInicio, Long usuarioId) {
        // Ajustar al lunes de la semana
        LocalDate lunes = fechaInicio.with(DayOfWeek.MONDAY);
        LocalDate domingo = lunes.plusDays(6);

        UsersModel usuario = userRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        PlanificacionSemanalModel planificacion = PlanificacionSemanalModel.builder()
                .fechaInicio(lunes)
                .fechaFin(domingo)
                .creadoPor(usuario)
                .build();

        planificacion = planificacionRepository.save(planificacion);
        return convertirAPlanificacionDTO(planificacion);
    }

    @Override
    @Transactional(readOnly = true)
    public PlanificacionSemanalDTO obtenerPlanificacionActual() {
        return obtenerPlanificacionPorFecha(LocalDate.now());
    }

    // En PlanificacionServiceImpl.java - Actualizar el método
    // obtenerPlanificacionPorFecha

    @Override
    @Transactional(readOnly = true)
    public PlanificacionSemanalDTO obtenerPlanificacionPorFecha(LocalDate fecha) {

        PlanificacionSemanalModel planificacion = planificacionRepository.findByFecha(fecha)
                .orElseThrow(() -> new RuntimeException("No hay planificación para la fecha: " + fecha));

        return convertirAPlanificacionDTO(planificacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanificacionSemanalDTO> listarPlanificaciones() {
        return planificacionRepository.findAllOrderByFechaDesc()
                .stream()
                .map(this::convertirAPlanificacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TrabajoProgramadoDTO crearTrabajo(CrearTrabajoRequestDTO request) {
        // 1. Validar planificación
        PlanificacionSemanalModel planificacion = planificacionRepository
                .findById(request.getIdPlanificacion())
                .orElseThrow(() -> new RuntimeException("Planificación no encontrada"));

        // 2. Obtener el pedido con todas sus relaciones
        PedidoModel pedido = pedidoRepository.findById(request.getIdPedido())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // 3. Obtener datos del cliente
        ClienteModel cliente = pedido.getCliente();
        String nombreCliente = obtenerNombreCliente(cliente);
        String direccionCliente = obtenerDireccionCliente(cliente);

        // 4. Construir descripción con todos los trabajos del pedido
        List<CotizacionTrabajoModel> trabajosCotizacion = cotizacionTrabajoRepository
                .findByCotizacion_IdCotizacion(pedido.getCotizacion().getIdCotizacion());

        StringBuilder descripcion = new StringBuilder();
        for (CotizacionTrabajoModel ct : trabajosCotizacion) {
            descripcion.append(String.format("• %s (Cant: %d, Área: %.2f m²)\n",
                    ct.getSolicitudTrabajo().getTrabajo().getNombre(),
                    ct.getCantidad(),
                    ct.getAreaTotal()));
        }

        EmployeeModel trabajadorAsignado = null;
        String nombreTrabajador = request.getTrabajador();
        if (request.getIdTrabajador() != null) {
            trabajadorAsignado = employeeRepository.findById(request.getIdTrabajador()).orElse(null);
            if (trabajadorAsignado != null && trabajadorAsignado.getPeople() != null) {
                PeopleModel p = trabajadorAsignado.getPeople();
                nombreTrabajador = (p.getName_people() + " " + (p.getAp() != null ? p.getAp() : "")).trim();
            }
        }

        // Si el pedido estaba en EN_PROCESO, al entrar al planner pasa a EN_TALLER
        if (pedido.getEstadoPedido() == EstadoPedido.PENDIENTE || pedido.getEstadoPedido() == EstadoPedido.EN_PROCESO) {
            pedido.setEstadoPedido(EstadoPedido.EN_TALLER);
            pedidoRepository.save(pedido);
        }

        // 6. Crear el trabajo programado
        TrabajoProgramadoModel trabajo = TrabajoProgramadoModel.builder()
                .planificacion(planificacion)
                .pedido(pedido)
                // Datos automáticos del pedido
                .cliente(nombreCliente)
                .descripcionTrabajo(descripcion.toString().trim())
                .direccion(direccionCliente)
                // Datos de programación
                .areaTrabajo(request.getAreaTrabajo())
                .trabajadorAsignado(trabajadorAsignado)
                .trabajador(nombreTrabajador)
                .fechaProgramada(request.getFechaProgramada())
                .horaProgramada(request.getHoraProgramada())
                .observaciones(request.getObservaciones())
                .estado(EstadoTrabajoProgramado.PENDIENTE)
                .cumplido(false)
                .build();

        trabajo = trabajoRepository.save(trabajo);
        return convertirATrabajoDTO(trabajo);
    }

    @Override
    @Transactional
    public TrabajoProgramadoDTO actualizarTrabajo(Long id, CrearTrabajoRequestDTO request) {
        TrabajoProgramadoModel trabajo = trabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

        // Solo actualizar campos de programación
        // Los datos del cliente/pedido NO se cambian manualmente
        trabajo.setAreaTrabajo(request.getAreaTrabajo());
        trabajo.setFechaProgramada(request.getFechaProgramada());
        trabajo.setHoraProgramada(request.getHoraProgramada());
        trabajo.setObservaciones(request.getObservaciones());

        if (request.getIdTrabajador() != null) {
            EmployeeModel emp = employeeRepository.findById(request.getIdTrabajador()).orElse(null);
            if (emp != null) {
                trabajo.setTrabajadorAsignado(emp);
                if (emp.getPeople() != null) {
                    trabajo.setTrabajador((emp.getPeople().getName_people() + " " + (emp.getPeople().getAp() != null ? emp.getPeople().getAp() : "")).trim());
                }
            }
        } else if (request.getTrabajador() != null) {
            trabajo.setTrabajador(request.getTrabajador());
        }

        trabajo.setUltimaModificacion(LocalDateTime.now());

        trabajo = trabajoRepository.save(trabajo);
        return convertirATrabajoDTO(trabajo);
    }

    @Override
    @Transactional
    public void eliminarTrabajo(Long id) {
        trabajoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TrabajoProgramadoDTO marcarComoCompletado(Long id) {
        TrabajoProgramadoModel trabajo = trabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

        trabajo.setEstado(EstadoTrabajoProgramado.COMPLETADO);
        trabajo.setCumplido(true);
        trabajo.setUltimaModificacion(LocalDateTime.now());

        trabajo = trabajoRepository.save(trabajo);

        // Si el trabajo pertenece a un pedido, verificar si todos los trabajos del pedido están completos
        if (trabajo.getPedido() != null) {
            PedidoModel pedido = trabajo.getPedido();
            List<TrabajoProgramadoModel> trabajosDelPedido = trabajoRepository.findByPedido_IdPedido(pedido.getIdPedido());
            boolean todosCompletos = trabajosDelPedido.stream()
                    .allMatch(t -> t.getEstado() == EstadoTrabajoProgramado.COMPLETADO);
            if (todosCompletos && pedido.getEstadoPedido() != EstadoPedido.ENTREGADO && pedido.getEstadoPedido() != EstadoPedido.CANCELADO) {
                pedido.setEstadoPedido(EstadoPedido.FINALIZADO);
                pedidoRepository.save(pedido);
            }
        }

        return convertirATrabajoDTO(trabajo);
    }

    @Override
    @Transactional
    public TrabajoProgramadoDTO reprogramarTrabajo(Long id, ReprogramarTrabajoRequestDTO request, Long usuarioId) {
        TrabajoProgramadoModel trabajo = trabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

        UsersModel usuario = userRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Registrar historial
        ReprogramacionTrabajoModel reprogramacion = ReprogramacionTrabajoModel.builder()
                .trabajoProgramado(trabajo)
                .fechaOriginal(trabajo.getFechaProgramada())
                .fechaNueva(request.getNuevaFecha())
                .motivo(request.getMotivo())
                .usuarioReprogramo(usuario)
                .build();

        reprogramacionRepository.save(reprogramacion);

        // Actualizar trabajo
        trabajo.setFechaProgramada(request.getNuevaFecha());
        trabajo.setEstado(EstadoTrabajoProgramado.REPROGRAMADO);
        trabajo.setUltimaModificacion(LocalDateTime.now());

        trabajo = trabajoRepository.save(trabajo);
        return convertirATrabajoDTO(trabajo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrabajoProgramadoDTO> obtenerTrabajosPorSemana(Long idPlanificacion) {
        return trabajoRepository.findByPlanificacion_IdPlanificacion(idPlanificacion)
                .stream()
                .map(this::convertirATrabajoDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrabajoProgramadoDTO> obtenerTrabajosVencidos() {
        return trabajoRepository.findTrabajosVencidos(LocalDate.now())
                .stream()
                .map(this::convertirATrabajoDTO)
                .collect(Collectors.toList());
    }

    // Métodos auxiliares de conversión
    private PlanificacionSemanalDTO convertirAPlanificacionDTO(PlanificacionSemanalModel model) {
        PlanificacionSemanalDTO dto = new PlanificacionSemanalDTO();
        dto.setIdPlanificacion(model.getIdPlanificacion());
        dto.setFechaInicio(model.getFechaInicio());
        dto.setFechaFin(model.getFechaFin());
        dto.setObservaciones(model.getObservaciones());

        List<TrabajoProgramadoDTO> trabajos = trabajoRepository
                .findByPlanificacion_IdPlanificacion(model.getIdPlanificacion())
                .stream()
                .map(this::convertirATrabajoDTO)
                .collect(Collectors.toList());
        dto.setTrabajos(trabajos);

        // Calcular estadísticas
        PlanificacionSemanalDTO.EstadisticasDTO stats = new PlanificacionSemanalDTO.EstadisticasDTO();
        stats.setTotal(trabajos.size());
        stats.setPendientes(trabajos.stream().filter(t -> "PENDIENTE".equals(t.getEstado())).count());
        stats.setEnProceso(trabajos.stream().filter(t -> "EN_PROCESO".equals(t.getEstado())).count());
        stats.setCompletados(trabajos.stream().filter(t -> "COMPLETADO".equals(t.getEstado())).count());
        stats.setReprogramados(trabajos.stream().filter(t -> "REPROGRAMADO".equals(t.getEstado())).count());
        dto.setEstadisticas(stats);

        return dto;
    }

    private TrabajoProgramadoDTO convertirATrabajoDTO(TrabajoProgramadoModel model) {
        TrabajoProgramadoDTO dto = new TrabajoProgramadoDTO();
        dto.setIdTrabajoProgramado(model.getIdTrabajoProgramado());
        dto.setIdPlanificacion(model.getPlanificacion().getIdPlanificacion());
        dto.setIdPedido(model.getPedido() != null ? model.getPedido().getIdPedido() : null);
        dto.setCliente(model.getCliente());
        dto.setDescripcionTrabajo(model.getDescripcionTrabajo());
        dto.setAreaTrabajo(model.getAreaTrabajo());
        dto.setDireccion(model.getDireccion());
        if (model.getTrabajadorAsignado() != null) {
            dto.setIdTrabajador(model.getTrabajadorAsignado().getIdEmployee());
            if (model.getTrabajadorAsignado().getPeople() != null) {
                PeopleModel p = model.getTrabajadorAsignado().getPeople();
                dto.setTrabajador((p.getName_people() + " " + (p.getAp() != null ? p.getAp() : "")).trim());
            } else {
                dto.setTrabajador(model.getTrabajador());
            }
        } else {
            dto.setTrabajador(model.getTrabajador());
        }
        dto.setFechaProgramada(model.getFechaProgramada());
        dto.setHoraProgramada(model.getHoraProgramada());
        dto.setEstado(model.getEstado().name());
        dto.setCumplido(model.getCumplido());
        dto.setObservaciones(model.getObservaciones());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrabajoDisponibleDTO> obtenerTrabajosDisponibles(Long idPedido) {
        PedidoModel pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        return cotizacionTrabajoRepository
                .findByCotizacion_IdCotizacion(pedido.getCotizacion().getIdCotizacion())
                .stream()
                .map(ct -> {
                    TrabajoDisponibleDTO dto = new TrabajoDisponibleDTO();
                    dto.setIdCotizacionTrabajo(ct.getIdCotizacionTrabajo());
                    dto.setNombreTrabajo(ct.getSolicitudTrabajo().getTrabajo().getNombre());
                    dto.setDescripcionTrabajo(ct.getSolicitudTrabajo().getTrabajo().getDescripcion());
                    dto.setCantidad(ct.getCantidad());
                    dto.setAreaTotal(ct.getAreaTotal());
                    dto.setSubtotal(ct.getSubtotal());
                    dto.setYaProgramado(false); // Por ahora false, puedes implementar la lógica después
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private String obtenerNombreCliente(ClienteModel cliente) {
        if (cliente == null) return "Cliente no especificado";
        if ("Persona".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())) {
            PeopleModel persona = cliente.getPersona();
            if (persona == null) return "Cliente sin datos";
            return String.format("%s %s %s",
                    persona.getName_people() != null ? persona.getName_people() : "",
                    persona.getAp() != null ? persona.getAp() : "",
                    persona.getAm() != null ? persona.getAm() : "").trim();
        } else if (cliente.getEmpresa() != null) {
            return cliente.getEmpresa().getRazonSocial();
        }
        return "Cliente";
    }

    private String obtenerDireccionCliente(ClienteModel cliente) {
        if (cliente == null) return "";
        if ("Persona".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())) {
            return (cliente.getPersona() != null && cliente.getPersona().getAddres() != null)
                    ? cliente.getPersona().getAddres() : "";
        } else if (cliente.getEmpresa() != null && cliente.getEmpresa().getDireccion() != null) {
            return cliente.getEmpresa().getDireccion();
        }
        return "";
    }
}
