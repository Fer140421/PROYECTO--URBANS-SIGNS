package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Portal.ServicioPublicoDTO;
import com.example.urban_signs.Repository.TrabajosRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/portal/servicios")
@RequiredArgsConstructor
public class PortalServiciosController {

    private final TrabajosRepository trabajosRepository;

    @GetMapping
    public ResponseEntity<List<ServicioPublicoDTO>> listarServiciosPublicos() {
        List<ServicioPublicoDTO> servicios = trabajosRepository.findByEstadoTrueOrderByIdTrabajoAsc()
                .stream()
                .map(t -> ServicioPublicoDTO.builder()
                        .idTrabajo(t.getIdTrabajo())
                        .nombre(t.getNombre())
                        .descripcion(t.getDescripcion())
                        .foto(t.getFoto())
                        .build())
                .toList();

        return ResponseEntity.ok(servicios);
    }
}
