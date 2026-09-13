package com.example.urban_signs.Services;

import java.util.Optional;

import com.example.urban_signs.Model.SesionModel;

public interface RefreshTokenService {
    String crearToken(SesionModel sesion);

    TokenRotado rotarToken(String tokenActual);

    Optional<SesionModel> revocarToken(String token);

    record TokenRotado(SesionModel sesion, String token) {}
}
