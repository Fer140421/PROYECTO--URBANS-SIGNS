package com.example.urban_signs.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.urban_signs.Model.FacturacionModel;
import com.example.urban_signs.Model.PedidoModel;

@Repository
public interface FacturacionRepository extends JpaRepository<FacturacionModel, Long> {

    Optional<FacturacionModel> findByPedido(PedidoModel pedido);

    FacturacionModel findByPedido_IdPedido(Long idPedido);

    FacturacionModel findTopByOrderByIdDesc();

    Page<FacturacionModel> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT * FROM facturacion ORDER BY created_at DESC", countQuery = "SELECT count(*) FROM facturacion", nativeQuery = true)
    Page<FacturacionModel> listarFacturas(Pageable pageable);

}