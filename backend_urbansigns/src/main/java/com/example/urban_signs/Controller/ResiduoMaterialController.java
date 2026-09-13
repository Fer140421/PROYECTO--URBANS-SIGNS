package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Residuos.ResiduoMaterialDTO;
import com.example.urban_signs.Model.ResiduoMaterialModel;
import com.example.urban_signs.Services.ResiduoMaterialService;
import com.example.urban_signs.Utils.Enum.EstadoResiduo;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/residuos")
@RequiredArgsConstructor
public class ResiduoMaterialController {

    private final ResiduoMaterialService service;

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_CREAR')")
    public ResponseEntity<ResiduoMaterialModel> registrar(@RequestBody ResiduoMaterialDTO dto) {
        ResiduoMaterialModel residuo = service.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(residuo);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_EDITAR')")
    public ResponseEntity<ResiduoMaterialModel> actualizar(
            @PathVariable Long id,
            @RequestBody ResiduoMaterialDTO dto) {
        ResiduoMaterialModel residuo = service.actualizar(id, dto);
        return ResponseEntity.ok(residuo);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_VER')")
    public ResponseEntity<ResiduoMaterialModel> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_VER')")
    public ResponseEntity<List<ResiduoMaterialModel>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_ELIMINAR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/material/{idMaterial}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('RESIDUO_VER')")
    public ResponseEntity<Page<ResiduoMaterialModel>> listarPorMaterial(
            @PathVariable Long idMaterial,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) EstadoResiduo estado) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("fechaRegistro").descending());

        return ResponseEntity.ok(
                service.listarPorMaterial(idMaterial, estado, pageable));
    }

}
