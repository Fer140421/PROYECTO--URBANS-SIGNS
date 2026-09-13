package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Model.MaterialProduccionModel;

public interface LoteRepository extends JpaRepository<LoteMaterialModel, Long> {

    @Query("SELECT l FROM LoteMaterialModel l WHERE l.material = :material AND l.activo = true")
    LoteMaterialModel findByMaterialAndActivoTrue(@Param("material") MaterialProduccionModel material);

    List<LoteMaterialModel> findByMaterial_IdMaterialAndActivoTrueOrderByFechaIngresoAsc(Long idMaterial);

}
