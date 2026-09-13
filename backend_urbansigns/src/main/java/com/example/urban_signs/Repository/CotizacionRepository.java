package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;

public interface CotizacionRepository extends JpaRepository<CotizacionModel, Long> {
        Optional<CotizacionModel> findBySolicitud_IdSolicitud(Long idSolicitud);

        CotizacionModel findBySolicitud(SolicitudCotizacionModel solicitud);

        @Query("SELECT c FROM CotizacionModel c " +
                        "WHERE c.estado = :estado " +
                        "AND (:codCotizacion IS NULL OR c.codCotizacion LIKE %:codCotizacion%)")
        Page<CotizacionModel> filtrarPorEstadoYCodigo(@Param("estado") EstadoCotizacion estado,
                        @Param("codCotizacion") String codCotizacion,
                        Pageable pageable);

        List<CotizacionModel> findTop5ByOrderByFechaEmisionDesc();

        List<CotizacionModel> findBySolicitud_Cliente_IdClienteOrderByFechaEmisionDesc(Long idCliente);

        Optional<CotizacionModel> findByIdCotizacionAndSolicitud_Cliente_IdCliente(Long idCotizacion, Long idCliente);

}
