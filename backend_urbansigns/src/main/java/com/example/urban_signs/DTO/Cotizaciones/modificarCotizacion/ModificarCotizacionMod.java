package com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion;

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
public class ModificarCotizacionMod {

    private List<CotizacionTrabajoMod> trabajos;
}
