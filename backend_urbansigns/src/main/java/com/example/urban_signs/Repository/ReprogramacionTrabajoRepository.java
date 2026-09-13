package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.ReprogramacionTrabajoModel;

public interface ReprogramacionTrabajoRepository extends JpaRepository<ReprogramacionTrabajoModel, Long> {
    List<ReprogramacionTrabajoModel> findByTrabajoProgramado_IdTrabajoProgramado(Long idTrabajo);

}
