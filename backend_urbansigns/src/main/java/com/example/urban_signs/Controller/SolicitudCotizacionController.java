package com.example.urban_signs.Controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionDTO;
import com.example.urban_signs.DTO.Solicitudes.SolicitudCotizacionRequest;
import com.example.urban_signs.DTO.Solicitudes.SolicitudDetalleDTO;
import com.example.urban_signs.Model.SolicitudCotizacionModel;
import com.example.urban_signs.Services.SolicitudCotizacionService;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
public class SolicitudCotizacionController {
    private final SolicitudCotizacionService solicitudCotizacionService;

    @PostMapping("/registrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_CREAR')")
    public ResponseEntity<Void> registrarSolicitud(@RequestBody SolicitudCotizacionRequest request) {
        solicitudCotizacionService.registrarSolicitud(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/listar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_VER')")
    public Page<SolicitudCotizacionModel> listarSolicitudes(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam SolicitudCotizacion estado,
            @RequestParam(required = false) String codSolicitud) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaSolicitud").descending());

        return solicitudCotizacionService.listarSolicitudes(
                estado,
                codSolicitud,
                pageable);
    }

    @GetMapping("/detalle/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_VER')")
    public ResponseEntity<SolicitudCotizacionDTO> obtenerSolicitud(@PathVariable Long id) {
        SolicitudCotizacionDTO solicitud = solicitudCotizacionService.obtenerSolicitudConTrabajos(id);
        return ResponseEntity.ok(solicitud);
    }

    @PutMapping("/modificar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_EDITAR')")
    public ResponseEntity<SolicitudCotizacionModel> modificarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudCotizacionRequest request) {

        SolicitudCotizacionModel solicitudActualizada = solicitudCotizacionService.modificarSolicitud(id, request);
        return ResponseEntity.ok(solicitudActualizada);
    }

    @GetMapping("/det-mod/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_VER')")
    public ResponseEntity<SolicitudDetalleDTO> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudCotizacionService.obtenerDetalle(id));
    }

    @PutMapping("/cancelar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SOLICITUD_COTIZACION_EDITAR')")
    public ResponseEntity<Void> cancelarSolicitud(@PathVariable Long id) {
        solicitudCotizacionService.cancelarSolicitud(id);
        return ResponseEntity.ok().build();
    }
}
