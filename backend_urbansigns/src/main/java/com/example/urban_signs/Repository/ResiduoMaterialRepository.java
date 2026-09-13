package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.ResiduoMaterialModel;
import com.example.urban_signs.Utils.Enum.EstadoResiduo;

public interface ResiduoMaterialRepository extends JpaRepository<ResiduoMaterialModel, Long> {

    List<ResiduoMaterialModel> findByEstado(EstadoResiduo estado);

    List<ResiduoMaterialModel> findByMaterial_IdMaterial(Long idMaterial);

    Page<ResiduoMaterialModel> findByMaterial_IdMaterial(
            Long idMaterial,
            Pageable pageable);

    Page<ResiduoMaterialModel> findByMaterial_IdMaterialAndEstado(
            Long idMaterial,
            EstadoResiduo estado,
            Pageable pageable);
}