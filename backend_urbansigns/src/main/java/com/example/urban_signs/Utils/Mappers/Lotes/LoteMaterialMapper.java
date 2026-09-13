package com.example.urban_signs.Utils.Mappers.Lotes;

import com.example.urban_signs.DTO.Lotes.LoteMaterialDTO;
import com.example.urban_signs.Model.LoteMaterialModel;

public class LoteMaterialMapper {

    public static LoteMaterialDTO toDTO(LoteMaterialModel lote) {

        return LoteMaterialDTO.builder()
                .idLote(lote.getIdLote())
                .codigoLote(lote.getCodigoLote())
                .fechaIngreso(lote.getFechaIngreso())
                .cantidadInicial(lote.getCantidadInicial())
                .cantidadActual(lote.getCantidadActual())
                .ubicacion(lote.getUbicacion())
                .activo(lote.getActivo())
                .build();
    }
}
