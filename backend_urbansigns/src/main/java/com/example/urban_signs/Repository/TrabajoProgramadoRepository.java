package com.example.urban_signs.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.urban_signs.Model.TrabajoProgramadoModel;
import com.example.urban_signs.Utils.Enum.EstadoTrabajoProgramado;

public interface TrabajoProgramadoRepository extends JpaRepository<TrabajoProgramadoModel, Long> {
    List<TrabajoProgramadoModel> findByPlanificacion_IdPlanificacion(Long idPlanificacion);

    List<TrabajoProgramadoModel> findByPedido_IdPedido(Long idPedido);

    List<TrabajoProgramadoModel> findByFechaProgramadaBetween(LocalDate inicio, LocalDate fin);

    List<TrabajoProgramadoModel> findByEstado(EstadoTrabajoProgramado estado);

    @Query("SELECT t FROM TrabajoProgramadoModel t WHERE t.fechaProgramada <= :fecha AND t.estado != 'COMPLETADO'")
    List<TrabajoProgramadoModel> findTrabajosVencidos(LocalDate fecha);

    long countByEstado(EstadoTrabajoProgramado estado);

}