package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.data.domain.Page;
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

import com.example.urban_signs.DTO.MaterialTrabajo.HerramientaListDTO;
import com.example.urban_signs.DTO.MaterialTrabajo.MaterialTrabajoRegistrarDTO;
import com.example.urban_signs.Model.HerramientasModel;
import com.example.urban_signs.Projection.MaterialesTrabajo.MaterialListProjection;
import com.example.urban_signs.Services.MaterialTrabajoService;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/herramientas")
@RequiredArgsConstructor
public class HerramientasController {

    private final MaterialTrabajoService service;

    @GetMapping("/listHerramientas")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_VER')")
    public ResponseEntity<Page<HerramientaListDTO>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String activo,
            @RequestParam(required = false) String filtro) {

        Page<HerramientaListDTO> result = service.listAllConFiltros(page, size, activo, filtro);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_VER')")
    public ResponseEntity<HerramientasModel> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/RegistrarMaterial")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_CREAR')")
    public ResponseEntity<?> create(
            @RequestPart("material") MaterialTrabajoRegistrarDTO dto,
            @RequestPart("file") MultipartFile file) {
        HerramientasModel saved = service.save(dto, file);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/modificar-Material/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_EDITAR')")
    public ResponseEntity<HerramientasModel> update(
            @PathVariable Long id,
            @RequestPart("material") MaterialTrabajoRegistrarDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            HerramientasModel updated = service.update(id, dto, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/eliminar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_ELIMINAR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/activos")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_VER')")
    public List<MaterialListProjection> listarMaterialesActivos() {
        return service.obtenerMaterialesActivos();
    }

    @PutMapping("/actualizar-estado/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('HERRAMIENTA_EDITAR')")
    public ResponseEntity<HerramientasModel> actualizarEstado(
            @PathVariable Long id,
            @RequestParam("estado") EstadoHerramienta estado) {
        try {
            HerramientasModel herramienta = service.actualizarEstado(id, estado);
            return ResponseEntity.ok(herramienta);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
