package com.example.urban_signs.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Suppliers.SupplierDetailDTO;
import com.example.urban_signs.Model.SupplierModel;
import com.example.urban_signs.Services.SupplierService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping("/listSupplier")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_VER')")
    public List<SupplierModel> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/list-filters")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_VER')")
    public Page<SupplierDetailDTO> listWithFilters(
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        return supplierService.listSuppliers(status, searchTerm, pageable);
    }

    @PostMapping("/register-prov")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_CREAR')")
    public ResponseEntity<SupplierModel> registerSupplier(@RequestBody SupplierModel supplier) {
        SupplierModel created = supplierService.createSupplier(supplier);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/mod-prov/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_EDITAR')")
    public ResponseEntity<SupplierModel> updateSupplier(@PathVariable Long id, @RequestBody SupplierModel supplier) {
        SupplierModel updated = supplierService.updateSupplier(id, supplier);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/delete/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_ELIMINAR')")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplierLogically(id);
        return ResponseEntity.ok().body(Map.of("message", "Proveedor eliminado correctamente."));
    }

    @PutMapping("/activate/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PROVEEDOR_EDITAR')")
    public ResponseEntity<?> activateSupplier(@PathVariable Long id) {
        supplierService.activateSupplier(id);
        return ResponseEntity.ok().body(Map.of("message", "Proveedor activado correctamente."));
    }

}
