package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.SesionAccionModel;

public interface SessionAccionRepository extends JpaRepository<SesionAccionModel, Long> {
    List<SesionAccionModel> findBySesion_IdSesionOrderByFechaAccionDesc(Long idSesion);

}