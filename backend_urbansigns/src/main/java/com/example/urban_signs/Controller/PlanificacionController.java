package com.example.urban_signs.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.SeguimientoPedido.CrearTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.PlanificacionSemanalDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.ReprogramarTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoDisponibleDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoProgramadoDTO;
import com.example.urban_signs.Services.PlanificacionSemanalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/planificacion")
@RequiredArgsConstructor
public class PlanificacionController {

    private final PlanificacionSemanalService planificacionService;

    // Crear nueva planificación semanal
    @PostMapping("/crear")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_CREAR')")
    public ResponseEntity<PlanificacionSemanalDTO> crearPlanificacion(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam Long usuarioId) {
        return ResponseEntity.ok(planificacionService.crearPlanificacionSemanal(fechaInicio, usuarioId));
    }

    // Obtener planificación actual (semana en curso)
    @GetMapping("/actual")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_VER')")
    public ResponseEntity<?> obtenerPlanificacionActual() {
        try {
            return ResponseEntity.ok(planificacionService.obtenerPlanificacionActual());
        } catch (RuntimeException e) {
            if (e.getMessage().contains("No hay planificación")) {
                // Retornar 404 con mensaje claro
                return ResponseEntity.status(404)
                        .body(Map.of(
                                "error", "NO_PLANIFICACION",
                                "message", "No existe planificación para la semana actual",
                                "sugerencia", "Crear una nueva planificación"));
            }
            throw e;
        }
    }

    // Obtener planificación por fecha
    @GetMapping("/por-fecha")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_VER')")
    public ResponseEntity<PlanificacionSemanalDTO> obtenerPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(planificacionService.obtenerPlanificacionPorFecha(fecha));
    }

    // Listar todas las planificaciones
    @GetMapping("/listar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_VER')")
    public ResponseEntity<List<PlanificacionSemanalDTO>> listarPlanificaciones() {
        return ResponseEntity.ok(planificacionService.listarPlanificaciones());
    }

    // Crear nuevo trabajo programado
    @PostMapping("/trabajos/crear")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_CREAR')")
    public ResponseEntity<TrabajoProgramadoDTO> crearTrabajo(@RequestBody CrearTrabajoRequestDTO request) {
        return ResponseEntity.ok(planificacionService.crearTrabajo(request));
    }

    // Actualizar trabajo
    @PutMapping("/trabajos/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_EDITAR')")
    public ResponseEntity<TrabajoProgramadoDTO> actualizarTrabajo(
            @PathVariable Long id,
            @RequestBody CrearTrabajoRequestDTO request) {
        return ResponseEntity.ok(planificacionService.actualizarTrabajo(id, request));
    }

    // Eliminar trabajo
    @DeleteMapping("/trabajos/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_ELIMINAR')")
    public ResponseEntity<Void> eliminarTrabajo(@PathVariable Long id) {
        planificacionService.eliminarTrabajo(id);
        return ResponseEntity.noContent().build();
    }

    // Marcar trabajo como completado
    @PutMapping("/trabajos/{id}/completar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_EDITAR')")
    public ResponseEntity<TrabajoProgramadoDTO> marcarCompletado(@PathVariable Long id) {
        return ResponseEntity.ok(planificacionService.marcarComoCompletado(id));
    }

    // Reprogramar trabajo
    @PutMapping("/trabajos/{id}/reprogramar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_EDITAR')")
    public ResponseEntity<TrabajoProgramadoDTO> reprogramarTrabajo(
            @PathVariable Long id,
            @RequestBody ReprogramarTrabajoRequestDTO request,
            @RequestParam Long usuarioId) {
        return ResponseEntity.ok(planificacionService.reprogramarTrabajo(id, request, usuarioId));
    }

    // Obtener trabajos de una semana
    @GetMapping("/trabajos/semana/{idPlanificacion}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_VER')")
    public ResponseEntity<List<TrabajoProgramadoDTO>> obtenerTrabajosSemana(@PathVariable Long idPlanificacion) {
        return ResponseEntity.ok(planificacionService.obtenerTrabajosPorSemana(idPlanificacion));
    }

    // Obtener trabajos vencidos
    @GetMapping("/trabajos/vencidos")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PLANIFICACION_VER')")
    public ResponseEntity<List<TrabajoProgramadoDTO>> obtenerTrabajosVencidos() {
        return ResponseEntity.ok(planificacionService.obtenerTrabajosVencidos());
    }

    // En PlanificacionController.java

}
