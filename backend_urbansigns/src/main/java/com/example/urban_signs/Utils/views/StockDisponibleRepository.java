package com.example.urban_signs.Utils.views;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockDisponibleRepository extends JpaRepository<StockDisponible, Long> {

    Page<StockDisponible> findByNombreMaterialContainingIgnoreCase(String nombreMaterial, Pageable pageable);

}
