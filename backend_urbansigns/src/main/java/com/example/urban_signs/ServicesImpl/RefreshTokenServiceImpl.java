package com.example.urban_signs.ServicesImpl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.urban_signs.Model.RefreshTokenModel;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Repository.RefreshTokenRepository;
import com.example.urban_signs.Services.RefreshTokenService;
import com.example.urban_signs.Utils.Enum.EstadoSession;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh.expiration}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public String crearToken(SesionModel sesion) {
        return guardarNuevoToken(sesion).token;
    }

    @Override
    @Transactional
    public TokenRotado rotarToken(String tokenActual) {
        RefreshTokenModel actual = refreshTokenRepository.findByTokenHash(hash(tokenActual))
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido"));

        LocalDateTime ahora = LocalDateTime.now();
        if (actual.getRevocadoEn() != null || actual.getUsadoEn() != null || actual.getExpiraEn().isBefore(ahora)) {
            revocarTokensActivos(actual.getSesion().getIdSesion(), ahora);
            throw new IllegalArgumentException("Refresh token expirado o reutilizado");
        }

        SesionModel sesion = actual.getSesion();
        if (sesion.getEstado() != EstadoSession.ACTIVO) {
            throw new IllegalArgumentException("La sesión está cerrada");
        }
        TokenNuevo nuevo = guardarNuevoToken(sesion);
        actual.setUsadoEn(ahora);
        actual.setRevocadoEn(ahora);
        actual.setReemplazadoPor(nuevo.modelo.getIdRefreshToken());
        refreshTokenRepository.save(actual);

        return new TokenRotado(sesion, nuevo.token);
    }

    @Override
    @Transactional
    public Optional<SesionModel> revocarToken(String token) {
        return refreshTokenRepository.findByTokenHash(hash(token)).map(refreshToken -> {
            if (refreshToken.getRevocadoEn() == null) {
                refreshToken.setRevocadoEn(LocalDateTime.now());
                refreshTokenRepository.save(refreshToken);
            }
            return refreshToken.getSesion();
        });
    }

    private TokenNuevo guardarNuevoToken(SesionModel sesion) {
        String token = generarTokenSeguro();
        RefreshTokenModel refreshToken = new RefreshTokenModel();
        refreshToken.setSesion(sesion);
        refreshToken.setTokenHash(hash(token));
        refreshToken.setCreadoEn(LocalDateTime.now());
        refreshToken.setExpiraEn(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000));
        return new TokenNuevo(refreshTokenRepository.save(refreshToken), token);
    }

    private void revocarTokensActivos(Long idSesion, LocalDateTime ahora) {
        List<RefreshTokenModel> tokens = refreshTokenRepository.findAllBySesion_IdSesionAndRevocadoEnIsNull(idSesion);
        tokens.forEach(token -> token.setRevocadoEn(ahora));
        refreshTokenRepository.saveAll(tokens);
    }

    private String generarTokenSeguro() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no está disponible", e);
        }
    }

    private record TokenNuevo(RefreshTokenModel modelo, String token) {}
}
