package com.example.urban_signs.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.urban_signs.Model.PlanificacionSemanalModel;

public interface PlanificacionSemanalRepository extends JpaRepository<PlanificacionSemanalModel, Long> {

    @Query("SELECT p FROM PlanificacionSemanalModel p WHERE :fecha BETWEEN p.fechaInicio AND p.fechaFin")
    Optional<PlanificacionSemanalModel> findByFecha(LocalDate fecha);

    List<PlanificacionSemanalModel> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT p FROM PlanificacionSemanalModel p ORDER BY p.fechaInicio DESC")
    List<PlanificacionSemanalModel> findAllOrderByFechaDesc();
}