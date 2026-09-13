package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.urban_signs.Model.PagoPedidoModel;

public interface PagosPedidoRepository extends JpaRepository<PagoPedidoModel, Long> {

    @Query("SELECT p FROM PagoPedidoModel p ORDER BY p.fechaPago DESC")
    List<PagoPedidoModel> findTop5ByOrderByFechaPagoDesc(Pageable pageable);
}