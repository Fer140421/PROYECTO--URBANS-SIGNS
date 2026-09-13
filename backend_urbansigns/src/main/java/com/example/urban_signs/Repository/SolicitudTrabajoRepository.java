package com.example.urban_signs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.SolicitudTrabajoModel;

public interface SolicitudTrabajoRepository extends JpaRepository<SolicitudTrabajoModel, Long> {
    List<SolicitudTrabajoModel> findBySolicitud_IdSolicitud(Long idSolicitud);

    @Modifying
    @Query("DELETE FROM SolicitudTrabajoModel st WHERE st.solicitud.idSolicitud = :idSolicitud")
    void deleteBySolicitudId(@Param("idSolicitud") Long idSolicitud);

    List<SolicitudTrabajoModel> findBySolicitudIdSolicitud(Long idSolicitud);

    @Query("SELECT st FROM SolicitudTrabajoModel st " +
            "JOIN FETCH st.trabajo t " +
            "WHERE st.solicitud.idSolicitud = :idSolicitud")
    List<SolicitudTrabajoModel> findBySolicitudId(@Param("idSolicitud") Long idSolicitud);

}
