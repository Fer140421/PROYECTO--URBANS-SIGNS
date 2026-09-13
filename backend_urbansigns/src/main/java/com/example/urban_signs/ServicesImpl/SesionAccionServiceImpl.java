package com.example.urban_signs.ServicesImpl;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.SesionAccionModel;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Repository.SessionAccionRepository;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Services.SesionAccionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SesionAccionServiceImpl implements SesionAccionService {

    private final SessionRepository sesionRepository;
    private final SessionAccionRepository sesionAccionRepository;

    @Override
    public void registrarAccion(Long idSesion, String descripcion, String modulo) {

        SesionModel sesion = sesionRepository.findById(idSesion)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        SesionAccionModel accion = new SesionAccionModel();
        accion.setSesion(sesion);
        accion.setDescripcion(descripcion);
        accion.setModulo(modulo);
        accion.setFechaAccion(LocalDateTime.now(ZoneId.of("America/La_Paz")));

        sesionAccionRepository.save(accion);
    }
}
