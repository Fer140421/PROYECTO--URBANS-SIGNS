package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.HerramientasModel;
import com.example.urban_signs.Projection.MaterialesTrabajo.MaterialListProjection;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

public interface MaterialTrabajoRepository extends JpaRepository<HerramientasModel, Long> {
  @Query(value = """
      SELECT h.* FROM herramientas h
      WHERE (:estado_actual IS NULL OR h.estado_actual = :estado_actual)
        AND (
          :filtro IS NULL
          OR LOWER(h.nombre) LIKE LOWER(CONCAT('%', :filtro, '%'))
          OR LOWER(h.codigo) LIKE LOWER(CONCAT('%', :filtro, '%'))
        )
      ORDER BY h.id_herramienta DESC
      """, countQuery = """
      SELECT COUNT(*) FROM herramientas h
      WHERE (:estado_actual IS NULL OR h.estado_actual = :estado_actual)
        AND (
          :filtro IS NULL
          OR LOWER(h.nombre) LIKE LOWER(CONCAT('%', :filtro, '%'))
          OR LOWER(h.codigo) LIKE LOWER(CONCAT('%', :filtro, '%'))
        )
      """, nativeQuery = true)
  Page<HerramientasModel> buscarPorActivoYNombreOCodigo(
      @Param("estado_actual") String estado_actual,
      @Param("filtro") String filtro,
      Pageable pageable);

  @Query(value = "SELECT m.id_herramienta AS idHerramienta, " +
      "m.nombre AS nombre, " +
      "m.codigo AS codigo, " +
      "m.foto AS foto " +
      "FROM herramientas m " +
      "WHERE m.activo = true and m.estado_actual='DISPONIBLE'", nativeQuery = true)
  List<MaterialListProjection> findMaterialesActivos();

  Long countByEstadoActual(EstadoHerramienta estado);

}