package com.example.urban_signs.Controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Sesiones.SesionDetalleDTO;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Services.SessionService;
import com.example.urban_signs.Utils.Enum.EstadoSession;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/listSession")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SESION_VER')")
    public Page<SesionModel> listarSesiones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) EstadoSession estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        PageRequest pageable = PageRequest.of(page, size);
        return sessionService.listarSesiones(pageable, estado, inicio, fin);
    }

    @GetMapping("/{idSesion}/detalle")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('SESION_VER')")
    public ResponseEntity<SesionDetalleDTO> obtenerDetalleSesion(@PathVariable Long idSesion) {
        try {
            SesionDetalleDTO detalle = sessionService.obtenerDetalleSesion(idSesion);
            return ResponseEntity.ok(detalle);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
