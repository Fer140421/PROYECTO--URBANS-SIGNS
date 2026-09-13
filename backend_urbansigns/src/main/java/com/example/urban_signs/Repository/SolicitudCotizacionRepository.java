package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.SolicitudCotizacionModel;

public interface SolicitudCotizacionRepository extends JpaRepository<SolicitudCotizacionModel, Long> {
  boolean existsByCodSolicitud(String codSolicitud);

  List<SolicitudCotizacionModel> findByCliente_IdClienteOrderByFechaSolicitudDesc(Long idCliente);

  @Query(value = """
      SELECT *
      FROM solicitud_cotizacion
      WHERE estado = :estado
        AND (:codSolicitud IS NULL OR LOWER(cod_solicitud) LIKE LOWER('%' || :codSolicitud || '%'))
      ORDER BY fecha_solicitud DESC
      LIMIT :limit OFFSET :offset
      """, countQuery = """
      SELECT COUNT(*)
      FROM solicitud_cotizacion
      WHERE estado = :estado
        AND (:codSolicitud IS NULL OR LOWER(cod_solicitud) LIKE LOWER('%' || :codSolicitud || '%'))
      """, nativeQuery = true)
  List<SolicitudCotizacionModel> findByFiltrosNative(
      @Param("estado") String estado,
      @Param("codSolicitud") String codSolicitud,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Query(value = """
      SELECT COUNT(*)
      FROM solicitud_cotizacion
      WHERE estado = :estado
        AND (:codSolicitud IS NULL OR LOWER(cod_solicitud) LIKE LOWER('%' || :codSolicitud || '%'))
      """, nativeQuery = true)
  long countByFiltros(@Param("estado") String estado, @Param("codSolicitud") String codSolicitud);

}
