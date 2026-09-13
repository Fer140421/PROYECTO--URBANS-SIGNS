package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.RefreshTokenModel;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenModel, Long> {
    Optional<RefreshTokenModel> findByTokenHash(String tokenHash);

    List<RefreshTokenModel> findAllBySesion_IdSesionAndRevocadoEnIsNull(Long idSesion);
}
