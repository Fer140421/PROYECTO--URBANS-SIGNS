package com.example.urban_signs.Services;

import java.time.LocalDate;
import java.util.List;

import com.example.urban_signs.DTO.SeguimientoPedido.CrearTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.PlanificacionSemanalDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.ReprogramarTrabajoRequestDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoDisponibleDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoProgramadoDTO;

public interface PlanificacionSemanalService {
    PlanificacionSemanalDTO crearPlanificacionSemanal(LocalDate fechaInicio, Long usuarioId);

    PlanificacionSemanalDTO obtenerPlanificacionActual();

    PlanificacionSemanalDTO obtenerPlanificacionPorFecha(LocalDate fecha);

    List<PlanificacionSemanalDTO> listarPlanificaciones();

    TrabajoProgramadoDTO crearTrabajo(CrearTrabajoRequestDTO request);

    TrabajoProgramadoDTO actualizarTrabajo(Long id, CrearTrabajoRequestDTO request);

    void eliminarTrabajo(Long id);

    TrabajoProgramadoDTO marcarComoCompletado(Long id);

    TrabajoProgramadoDTO reprogramarTrabajo(Long id, ReprogramarTrabajoRequestDTO request, Long usuarioId);

    List<TrabajoProgramadoDTO> obtenerTrabajosPorSemana(Long idPlanificacion);

    List<TrabajoProgramadoDTO> obtenerTrabajosVencidos();

    List<TrabajoDisponibleDTO> obtenerTrabajosDisponibles(Long idPedido);
}