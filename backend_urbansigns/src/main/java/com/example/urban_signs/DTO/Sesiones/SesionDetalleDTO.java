package com.example.urban_signs.DTO.Sesiones;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionDetalleDTO {
    
    private Long idSesion;
    private String nombreUsuario;
    private String correoUsuario;
    private LocalDateTime loginInicio;
    private LocalDateTime loginFin;
    private String ipDireccion;
    private String dispositivo;
    private String estado;
    private String duracionSesion; // Formato: "2h 30min"
    
    // Estadísticas de acciones
    private Integer totalAcciones;
    private Integer accionesPorModulo; // Se puede hacer un Map<String, Integer> si quieres
    
    // Lista de acciones realizadas en la sesión
    private List<AccionDTO> acciones;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccionDTO {
        private Long idAccion;
        private String descripcion;
        private String modulo;
        private LocalDateTime fechaAccion;
        private String tiempoTranscurrido; // Ej: "Hace 2 horas"
    }
}