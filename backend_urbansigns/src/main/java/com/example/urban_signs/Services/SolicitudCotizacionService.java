package com.example.urban_signs.Services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionDTO;
import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionRequest;
import com.example.urban_signs.DTO.Solicitudes.SolicitudDetalleDTO;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

import org.springframework.web.multipart.MultipartFile;

public interface SolicitudCotizacionService {
    SolicitudCotizacionModel registrarSolicitud(SolicitudCotizacionRequest request);

    SolicitudCotizacionModel registrarSolicitud(SolicitudCotizacionRequest request, MultipartFile file);

    Page<SolicitudCotizacionModel> listarSolicitudes(SolicitudCotizacion estado, String codSolicitud,
            Pageable pageable);

    SolicitudCotizacionDTO obtenerSolicitudConTrabajos(Long idSolicitud);

    SolicitudCotizacionModel modificarSolicitud(Long idSolicitud, SolicitudCotizacionRequest request);

    SolicitudDetalleDTO obtenerDetalle(Long idSolicitud);

    void cancelarSolicitud(Long idSolicitud);

}
