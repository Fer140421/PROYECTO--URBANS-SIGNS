package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.urban_signs.Model.DetallePrestamoModel;
import com.example.urban_signs.Services.DetallePrestamoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/detalles-prestamo")
@RequiredArgsConstructor
public class DetallePrestamoController {
 private final DetallePrestamoService service;

    @PostMapping("/registrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_CREAR')")
    public ResponseEntity<DetallePrestamoModel> registrar(@RequestBody DetallePrestamoModel detalle) {
        return ResponseEntity.ok(service.registrar(detalle));
    }

    @PutMapping("/modificar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_EDITAR')")
    public ResponseEntity<DetallePrestamoModel> modificar(@PathVariable Long id, @RequestBody DetallePrestamoModel detalle) {
        return ResponseEntity.ok(service.modificar(id, detalle));
    }

    @DeleteMapping("/eliminar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_ELIMINAR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_VER')")
    public ResponseEntity<List<DetallePrestamoModel>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/individual/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_VER')")
    public ResponseEntity<DetallePrestamoModel> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }
}
