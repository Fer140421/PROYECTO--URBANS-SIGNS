package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.PermisoModel;

public interface PermisoRepository extends JpaRepository<PermisoModel, Long> {

    List<PermisoModel> findByEstadoTrueOrderByModuloAscAccionAsc();
}
