package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.MaterialProduccionModel;

public interface MaterialProduccionRepository extends JpaRepository<MaterialProduccionModel, Long> {
  List<MaterialProduccionModel> findByCategoriaIdCategoria(Long idCategoria);

  @Query(value = """
      SELECT *
      FROM material_produccion
      WHERE (:nombre IS NULL OR LOWER(nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND estado = :estado
      ORDER BY id_material
      """, countQuery = """
      SELECT COUNT(*)
      FROM material_produccion
      WHERE (:nombre IS NULL OR LOWER(nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND estado = :estado
      """, nativeQuery = true)
  Page<MaterialProduccionModel> filtrar(
      @Param("nombre") String nombre,
      @Param("estado") Boolean estado,
      Pageable pageable);

  @Query(value = """
          SELECT
              (SELECT COUNT(*) FROM material_produccion) AS total_materiales,
              (SELECT COUNT(DISTINCT m.id_material)
               FROM material_produccion m
               JOIN lotes_material l
                 ON m.id_material = l.id_material
               WHERE l.activo = true AND l.cantidad_actual > 0) AS total_en_stock,
              (SELECT COUNT(*)
               FROM material_produccion m
               JOIN (
                   SELECT id_material, SUM(cantidad_actual) AS total_stock
                   FROM lotes_material
                   WHERE activo = true
                   GROUP BY id_material
               ) l ON m.id_material = l.id_material
               WHERE l.total_stock < m.stock_minimo) AS total_bajo_stock,
              (SELECT COUNT(*)
               FROM material_produccion m
               LEFT JOIN (
                   SELECT id_material, SUM(cantidad_actual) AS total_stock
                   FROM lotes_material
                   WHERE activo = true
                   GROUP BY id_material
               ) l ON m.id_material = l.id_material
               WHERE COALESCE(l.total_stock, 0) = 0) AS total_agotados
      """, nativeQuery = true)
  Object getMaterialStatsRaw();

  @Query("SELECT COUNT(m) FROM MaterialProduccionModel m " +
      "JOIN LoteMaterialModel l ON l.material.idMaterial = m.idMaterial " +
      "WHERE l.cantidadActual < m.stockMinimo AND l.activo = true")
  Long countStockCritico();

  @Query("SELECT m FROM MaterialProduccionModel m " +
      "JOIN LoteMaterialModel l ON l.material.idMaterial = m.idMaterial " +
      "WHERE l.cantidadActual < m.stockMinimo AND l.activo = true")
  List<MaterialProduccionModel> findMaterialesStockBajo();

}
