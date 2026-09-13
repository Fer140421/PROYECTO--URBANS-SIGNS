package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.MaterialProduccion.MaterialProduccionDTO;
import com.example.urban_signs.DTO.MaterialProduccion.MaterialStatsDTO;
import com.example.urban_signs.DTO.MaterialProduccion.RegistroMaterialDTO;
import com.example.urban_signs.Model.MaterialProduccionModel;

public interface MaterialProduccionService {
    Page<MaterialProduccionModel> listar(String nombre, Boolean estado, Pageable pageable);

    List<MaterialProduccionModel> findAll();

    MaterialProduccionModel guardar(RegistroMaterialDTO dto, MultipartFile file);

    MaterialProduccionModel actualizar(Long id, MaterialProduccionDTO dto, MultipartFile file);

    void eliminar(Long id);

    MaterialStatsDTO getMaterialStats();

    List<MaterialProduccionModel> findByCategoriaId(Long categoriaId);

    void reasignarCategoria(Long categoriaActualId, Long nuevaCategoriaId);
}