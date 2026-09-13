package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Residuos.ResiduoMaterialDTO;
import com.example.urban_signs.Model.ResiduoMaterialModel;
import com.example.urban_signs.Utils.Enum.EstadoResiduo;

public interface ResiduoMaterialService {

    ResiduoMaterialModel registrar(ResiduoMaterialDTO  residuo);

    ResiduoMaterialModel actualizar(Long id, ResiduoMaterialDTO  residuo);

    ResiduoMaterialModel obtenerPorId(Long id);

    List<ResiduoMaterialModel> listarTodos();

    void eliminar(Long id);

    Page<ResiduoMaterialModel> listarPorMaterial(
            Long idMaterial,
            EstadoResiduo estado,
            Pageable pageable);
}