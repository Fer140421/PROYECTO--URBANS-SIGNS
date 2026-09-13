package com.example.urban_signs.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Utils.Enum.EstadoSession;

public interface SessionRepository extends JpaRepository<SesionModel, Long> {

    @Query("SELECT s FROM SesionModel s WHERE s.usuario.idUser = :idUsuario AND s.estado = 'ACTIVO' ORDER BY s.loginInicio DESC")
    List<SesionModel> findActiveSessionsByUser(@Param("idUsuario") Long idUsuario);

    Page<SesionModel> findAllByEstadoAndLoginInicioBetween(
            EstadoSession estado,
            LocalDateTime inicio,
            LocalDateTime fin,
            Pageable pageable);

    Page<SesionModel> findAllByEstado(EstadoSession estado, Pageable pageable);

    Page<SesionModel> findAllByLoginInicioBetween(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);
}
