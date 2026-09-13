package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.MaterialProduccion.MaterialProduccionDTO;
import com.example.urban_signs.DTO.MaterialProduccion.MaterialStatsDTO;
import com.example.urban_signs.DTO.MaterialProduccion.RegistroMaterialDTO;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Services.MaterialProduccionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/material-produccion")
@RequiredArgsConstructor
public class MaterialProduccionController {

    private final MaterialProduccionService service;

    @GetMapping("/list")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_VER')")
    public ResponseEntity<Page<MaterialProduccionModel>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam Boolean estado,
            Pageable pageable) {
        return ResponseEntity.ok(service.listar(nombre, estado, pageable));
    }

    @PostMapping("/create")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_CREAR')")
    public ResponseEntity<?> crear(@RequestPart("material") RegistroMaterialDTO dto,
            @RequestPart("file") MultipartFile file) {
        MaterialProduccionModel saved = service.guardar(dto, file);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/update/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_EDITAR')")
    public ResponseEntity<MaterialProduccionModel> actualizar(
            @PathVariable Long id,
            @RequestPart("material") MaterialProduccionDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            MaterialProduccionModel actualizado = service.actualizar(id, dto, file);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_ELIMINAR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listAll")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_VER')")
    public List<MaterialProduccionModel> getAll() {
        return service.findAll();
    }

    @GetMapping("/stats")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_VER')")
    public MaterialStatsDTO getDashboardStats() {
        return service.getMaterialStats();
    }
}
