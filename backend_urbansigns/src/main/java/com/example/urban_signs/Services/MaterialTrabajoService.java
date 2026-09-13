package com.example.urban_signs.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.MaterialTrabajo.HerramientaListDTO;
import com.example.urban_signs.DTO.MaterialTrabajo.MaterialTrabajoRegistrarDTO;
import com.example.urban_signs.Model.HerramientasModel;
import com.example.urban_signs.Projection.MaterialesTrabajo.MaterialListProjection;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

public interface MaterialTrabajoService {

    Page<HerramientaListDTO> listAllConFiltros(
            int page, int size, String activo, String filtroTexto);

    Optional<HerramientasModel> getById(Long id);

    HerramientasModel save(MaterialTrabajoRegistrarDTO dto, MultipartFile file);

    HerramientasModel update(Long id, MaterialTrabajoRegistrarDTO dto, MultipartFile file);

    void delete(Long id);

    List<MaterialListProjection> obtenerMaterialesActivos();

  HerramientasModel actualizarEstado(Long id, EstadoHerramienta estado);
}