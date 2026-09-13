package com.example.urban_signs.DTO.Prestamo;

import java.util.List;

import com.example.urban_signs.Utils.Enum.TipoPrestamo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegistrarPrestamoDTO {
    private Long idEmpleado;
    private Long idPedido;
    private TipoPrestamo tipoPrestamo;
    private String observacion;
    private List<RegistroDetalleDTO> detalles;
}