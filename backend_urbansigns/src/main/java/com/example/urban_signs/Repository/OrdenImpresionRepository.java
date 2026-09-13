package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.urban_signs.Model.OrdenImpresionModel;
import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;

public interface OrdenImpresionRepository extends JpaRepository<OrdenImpresionModel, Long> {
    Page<OrdenImpresionModel> findAll(Pageable pageable);

    Optional<OrdenImpresionModel> findByNroOrden(String nroOrden);

    @Query(value = "SELECT * FROM orden_impresion ORDER BY id_orden DESC LIMIT 1", nativeQuery = true)
    Optional<OrdenImpresionModel> findLastOrden();

    Page<OrdenImpresionModel> findByEstado(estadoOrdenImpresion estado, Pageable pageable);

    List<OrdenImpresionModel> findByNroOrdenContainingIgnoreCaseOrUsuario_UserAccesContainingIgnoreCase(
            String nroOrden,
            String userAcces);

    Long countByEstado(estadoOrdenImpresion estado);

    List<OrdenImpresionModel> findByPedido_IdPedido(Long idPedido);

    Page<OrdenImpresionModel> findByUsuario_IdUser(Long idUser, Pageable pageable);

    boolean existsByNroOrden(String nroOrden);

}