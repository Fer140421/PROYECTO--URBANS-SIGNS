package com.example.urban_signs.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.UnidadMedidaModel;

public interface UnidadMedidaRepository extends JpaRepository<UnidadMedidaModel, Long> {
  @Query(value = """
      SELECT *
      FROM unidades_medida u
      WHERE (:nombre IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND u.estado = :estado
      """, countQuery = """
      SELECT COUNT(*)
      FROM unidades_medida u
      WHERE (:nombre IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND u.estado = :estado
      """, nativeQuery = true)
  Page<UnidadMedidaModel> filtrar(
      @Param("nombre") String nombre,
      @Param("estado") Boolean estado,
      Pageable pageable);

}