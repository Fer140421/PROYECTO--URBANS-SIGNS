package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.CotizacionTrabajoModel;

public interface CotizacionTrabajoRepository extends JpaRepository<CotizacionTrabajoModel, Long> {
    List<CotizacionTrabajoModel> findByCotizacion_IdCotizacion(Long idCotizacion);

}
