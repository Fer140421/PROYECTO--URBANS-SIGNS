package com.example.urban_signs.Services;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Sesiones.SesionDetalleDTO;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Utils.Enum.EstadoSession;

public interface SessionService {
    Page<SesionModel> listarSesiones(Pageable pageable, EstadoSession estado, LocalDateTime inicio,
            LocalDateTime fin);

    SesionDetalleDTO obtenerDetalleSesion(Long idSesion);

}
