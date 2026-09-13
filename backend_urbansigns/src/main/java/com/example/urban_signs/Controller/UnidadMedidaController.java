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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.Model.UnidadMedidaModel;
import com.example.urban_signs.Services.UnidadMedidaService;

import lombok.RequiredArgsConstructor;

@RestController
@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('UNIDAD_MEDIDA_ACCESO')")
@RequestMapping("/unidad-medida")
@RequiredArgsConstructor
public class UnidadMedidaController {
    private final UnidadMedidaService unidadMedidaService;

    @GetMapping("/list")
    public List<UnidadMedidaModel> listar() {
        return unidadMedidaService.findAll();
    }

    @GetMapping("/list-unidades")
    public ResponseEntity<Page<UnidadMedidaModel>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam Boolean estado,
            Pageable pageable) {
        return ResponseEntity.ok(unidadMedidaService.listar(nombre, estado, pageable));
    }

    @PostMapping("/register-unidad")
    public ResponseEntity<UnidadMedidaModel> crear(@RequestBody UnidadMedidaModel unidadMedida) {
        return ResponseEntity.ok(unidadMedidaService.crear(unidadMedida));
    }

    @PutMapping("/mod-unidad/{id}")
    public ResponseEntity<UnidadMedidaModel> actualizar(@PathVariable Long id,
            @RequestBody UnidadMedidaModel unidadMedida) {
        return ResponseEntity.ok(unidadMedidaService.actualizar(id, unidadMedida));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        unidadMedidaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
