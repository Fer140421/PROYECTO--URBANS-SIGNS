package com.example.urban_signs.ServicesImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Sesiones.SesionDetalleDTO;
import com.example.urban_signs.DTO.Sesiones.SesionDetalleDTO.AccionDTO;
import com.example.urban_signs.Model.SesionAccionModel;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Repository.SessionAccionRepository;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Services.SessionService;
import com.example.urban_signs.Utils.Enum.EstadoSession;
import java.time.Duration;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {
    private final SessionRepository sessionRepository;
    private final SessionAccionRepository sesionAccionRepository;

    @Override
    public Page<SesionModel> listarSesiones(Pageable pageable, EstadoSession estado, LocalDateTime inicio,
            LocalDateTime fin) {

        if (estado != null && inicio != null && fin != null) {
            return sessionRepository.findAllByEstadoAndLoginInicioBetween(estado, inicio, fin, pageable);
        } else if (estado != null) {
            return sessionRepository.findAllByEstado(estado, pageable);
        } else if (inicio != null && fin != null) {
            return sessionRepository.findAllByLoginInicioBetween(inicio, fin, pageable);
        } else {
            return sessionRepository.findAll(pageable);
        }
    }

    @Override
    public SesionDetalleDTO obtenerDetalleSesion(Long idSesion) {
        SesionModel sesion = sessionRepository.findById(idSesion)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        // Obtener todas las acciones de esta sesión
        List<SesionAccionModel> acciones = sesionAccionRepository.findBySesion_IdSesionOrderByFechaAccionDesc(idSesion);

        // Convertir acciones a DTOs
        List<AccionDTO> accionesDTOs = acciones.stream()
                .map(this::convertirAccionADTO)
                .collect(Collectors.toList());

        // Calcular duración de la sesión
        String duracion = calcularDuracionSesion(sesion.getLoginInicio(), sesion.getLoginFin());

        return SesionDetalleDTO.builder()
                .idSesion(sesion.getIdSesion())
                .nombreUsuario(sesion.getUsuario().getUserAcces())
                .correoUsuario(sesion.getUsuario().getUserAcces())
                .loginInicio(sesion.getLoginInicio())
                .loginFin(sesion.getLoginFin())
                .ipDireccion(sesion.getIpDireccion())
                .dispositivo(sesion.getDispositivo())
                .estado(sesion.getEstado().name())
                .duracionSesion(duracion)
                .totalAcciones(acciones.size())
                .acciones(accionesDTOs)
                .build();
    }

    private AccionDTO convertirAccionADTO(SesionAccionModel accion) {
        return AccionDTO.builder()
                .idAccion(accion.getIdAccion())
                .descripcion(accion.getDescripcion())
                .modulo(accion.getModulo())
                .fechaAccion(accion.getFechaAccion())
                .tiempoTranscurrido(calcularTiempoTranscurrido(accion.getFechaAccion()))
                .build();
    }

    private String calcularDuracionSesion(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio == null)
            return "N/A";

        LocalDateTime finReal = fin != null ? fin : LocalDateTime.now();
        Duration duracion = Duration.between(inicio, finReal);

        long horas = duracion.toHours();
        long minutos = duracion.toMinutes() % 60;

        if (horas > 0) {
            return String.format("%dh %dmin", horas, minutos);
        } else if (minutos > 0) {
            return String.format("%d minutos", minutos);
        } else {
            return "Menos de 1 minuto";
        }
    }

    private String calcularTiempoTranscurrido(LocalDateTime fechaAccion) {
        if (fechaAccion == null)
            return "N/A";

        Duration duracion = Duration.between(fechaAccion, LocalDateTime.now());

        long dias = duracion.toDays();
        long horas = duracion.toHours();
        long minutos = duracion.toMinutes();

        if (dias > 0) {
            return String.format("Hace %d día%s", dias, dias > 1 ? "s" : "");
        } else if (horas > 0) {
            return String.format("Hace %d hora%s", horas, horas > 1 ? "s" : "");
        } else if (minutos > 0) {
            return String.format("Hace %d minuto%s", minutos, minutos > 1 ? "s" : "");
        } else {
            return "Hace unos segundos";
        }
    }
}
