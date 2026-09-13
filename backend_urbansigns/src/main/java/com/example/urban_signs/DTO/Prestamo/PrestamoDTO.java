package com.example.urban_signs.DTO.Prestamo;

import java.time.LocalDateTime;
import java.util.List;

import com.example.urban_signs.Utils.Enum.TipoPrestamo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class PrestamoDTO {
    private Long idPrestamo;
    private Long idPedido;
    private Long idEmpleado;
    private String nombreEmpleado;
    private LocalDateTime fechaPrestamo;
    private LocalDateTime fechaDevolucion;
    private TipoPrestamo tipoPrestamo;
    private String estado;
    private String observacion;
    private List<DetallePrestamoDTO> detalles;

    public PrestamoDTO(Long idPrestamo, Long idEmpleado, String nombreEmpleado, LocalDateTime fechaPrestamo,
            LocalDateTime fechaDevolucion, TipoPrestamo tipoPrestamo, String estado, String observacion,
            List<DetallePrestamoDTO> detalles) {
        this.idPrestamo = idPrestamo;
        this.idPedido = null;
        this.idEmpleado = idEmpleado;
        this.nombreEmpleado = nombreEmpleado;
        this.fechaPrestamo = fechaPrestamo;
        this.fechaDevolucion = fechaDevolucion;
        this.tipoPrestamo = tipoPrestamo;
        this.estado = estado;
        this.observacion = observacion;
        this.detalles = detalles;
    }
}
