package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Trabajos.RegistroTrabajoDTO;
import com.example.urban_signs.DTO.Trabajos.TrabajoSimpleDTO;
import com.example.urban_signs.Model.TrabajosModel;
import com.example.urban_signs.Services.TrabajosService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/trabajos")
@RequiredArgsConstructor
public class TrabajosController {

    private final TrabajosService service;

    // ✅ Crear
    @PostMapping("/registrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_CREAR')")
    public ResponseEntity<TrabajosModel> crear(
            @RequestPart("data") RegistroTrabajoDTO dto,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(service.crear(dto, file));
    }

    // ✅ Editar
    @PutMapping("modificar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_EDITAR')")
    public ResponseEntity<TrabajosModel> editar(
            @PathVariable Long id,
            @RequestPart("data") RegistroTrabajoDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(service.editar(id, dto, file));
    }

    // ✅ Listar con paginación
    @GetMapping("/listar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_VER')")
    public ResponseEntity<Page<TrabajosModel>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Boolean estado,
            Pageable pageable) {

        Page<TrabajosModel> page = service.listarConFiltros(nombre, estado, pageable);
        return ResponseEntity.ok(page);
    }

    // ✅ Listar solo id y nombre
    @GetMapping("/simple")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_VER')")
    public ResponseEntity<List<TrabajoSimpleDTO>> listarSimple() {
        return ResponseEntity.ok(service.listarSimple());
    }

    // ✅ Eliminar lógico
    @PatchMapping("/eliminar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_ELIMINAR')")
    public ResponseEntity<TrabajosModel> eliminarLogico(@PathVariable Long id) {
        return ResponseEntity.ok(service.eliminarLogico(id));
    }

    // ✅ Activar lógico
    @PatchMapping("/activar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('TRABAJO_EDITAR')")
    public ResponseEntity<TrabajosModel> activar(@PathVariable Long id) {
        return ResponseEntity.ok(service.activar(id));
    }
}
