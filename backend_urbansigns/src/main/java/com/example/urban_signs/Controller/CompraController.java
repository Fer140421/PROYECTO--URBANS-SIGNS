package com.example.urban_signs.Controller;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Compras.Listado.CompraDTO;
import com.example.urban_signs.DTO.Compras.Registro.CompraRequestDTO;
import com.example.urban_signs.DTO.Compras.Registro.ConfirmarCompraDTO;
import com.example.urban_signs.Model.CompraModel;
import com.example.urban_signs.Services.CompraService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_CREAR')")
    @PostMapping("/crear")
    public ResponseEntity<Void> crearCompra(@RequestBody CompraRequestDTO dto) {
        compraService.crearCompra(dto);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_VER')")
    @GetMapping("/listar")
    public ResponseEntity<Page<CompraDTO>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long idCompra,
            @RequestParam(required = false) Long idProveedor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CompraDTO> compras = compraService.listarFiltradas(estado, idCompra, idProveedor, page, size);
        return ResponseEntity.ok(compras);
    }

    // Confirmar compra
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_EDITAR')")
    @PutMapping("/confirmar/{idCompra}")
    public ResponseEntity<Void> confirmarCompra(
            @PathVariable Long idCompra,
            @RequestBody ConfirmarCompraDTO dto) {
        compraService.confirmarCompra(idCompra, dto);
        return ResponseEntity.ok().build();
    }

    // Eliminar detalle de compra
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_EDITAR')")
    @DeleteMapping("/detalle/{id}")
    public ResponseEntity<Void> eliminarDetalle(@PathVariable Long id) {
        compraService.eliminarDetalleCompra(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/cancelar/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_EDITAR')")
    public ResponseEntity<CompraModel> cancelarCompra(@PathVariable Long id) {
        CompraModel compraCancelada = compraService.cancelarCompra(id);
        return ResponseEntity.ok(compraCancelada);
    }

    @PutMapping("/modificar/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COMPRA_EDITAR')")
    public ResponseEntity<Void> modificarCompra(
            @PathVariable("id") Long idCompra,
            @RequestBody CompraRequestDTO dto) {

        compraService.modificarCompra(idCompra, dto);
        return ResponseEntity.ok().build();
    }

}
