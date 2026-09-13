package com.example.urban_signs.DTO.Prestamo;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ModificarPrestamoDTO {
     private Long idPrestamo;
    private String estado;
    private String observacion;
    private LocalDateTime fechaPrestamo;   // solo lectura
    private LocalDateTime fechaDevolucion; // null hasta devolución
    private Long idEmpleado;               // solo id para no traer proxy
    private List<RegistroDetalleDTO> detalles;
}
