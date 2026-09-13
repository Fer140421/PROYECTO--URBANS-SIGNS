package com.example.urban_signs.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

public interface PedidosRepository extends JpaRepository<PedidoModel, Long> {

        List<PedidoModel> findByEstadoPedidoIn(List<EstadoPedido> estados);

        @Query("SELECT SUM(p.total) FROM PedidoModel p")
        BigDecimal sumTotalVentas();

        @Query("SELECT COUNT(p) FROM PedidoModel p WHERE p.estadoPedido = :estado")
        Long countByEstado(@Param("estado") String estado);

        Long countByEstadoPedido(EstadoPedido estado);

        List<PedidoModel> findTop5ByOrderByFechaPedidoDesc();

        @Query("SELECT p FROM PedidoModel p WHERE p.estadoPedido IN ('EN_PROCESO', 'FINALIZADO') " +
                        "AND p.fechaPedido BETWEEN :inicio AND :fin ORDER BY p.fechaPedido ASC")
        List<PedidoModel> findProximasEntregas(@Param("inicio") LocalDate inicio,
                        @Param("fin") LocalDate fin);

        Page<PedidoModel> findByEstadoPedido(EstadoPedido estado, Pageable pageable);

        List<PedidoModel> findByEstadoPedidoOrderByFechaPedidoDesc(EstadoPedido estado);

        List<PedidoModel> findByCliente_IdClienteOrderByFechaPedidoDesc(Long idCliente);

        Optional<PedidoModel> findByIdPedidoAndCliente_IdCliente(Long idPedido, Long idCliente);

}
