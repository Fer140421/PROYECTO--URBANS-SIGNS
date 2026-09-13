package com.example.urban_signs.Controller;
import org.springframework.data.domain.Page;
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
import com.example.urban_signs.DTO.Prestamo.PrestamoDTO;
import com.example.urban_signs.DTO.Prestamo.RegistrarPrestamoDTO;
import com.example.urban_signs.Model.PrestamoMaterialTrabajoModel;
import com.example.urban_signs.Services.PrestamoMaterialTrabajoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/prestamos")
@RequiredArgsConstructor
public class PrestamoMaterialTrabajoController {

    private final PrestamoMaterialTrabajoService service;

    @PostMapping("/registrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_CREAR')")
    public ResponseEntity<PrestamoMaterialTrabajoModel> registrar(@RequestBody RegistrarPrestamoDTO dto) {
        PrestamoMaterialTrabajoModel prestamo = service.registrar(dto);
        return ResponseEntity.ok(prestamo);
    }

    @PutMapping("/modificar/{idPrestamo}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_EDITAR')")
    public ResponseEntity<PrestamoMaterialTrabajoModel> modificar(
            @PathVariable Long idPrestamo,
            @RequestBody RegistrarPrestamoDTO dto) {
        PrestamoMaterialTrabajoModel prestamo = service.modificar(idPrestamo, dto);
        return ResponseEntity.ok(prestamo);
    }

    @DeleteMapping("/delete/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_ELIMINAR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/individual/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_VER')")
    public ResponseEntity<PrestamoMaterialTrabajoModel> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @GetMapping("/listPrestamos")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_VER')")
    public Page<PrestamoDTO> listarPrestamos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoPrestamo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.listarPrestamos(estado, tipoPrestamo, page, size);
    }

    @PutMapping("/devolucion/{idPrestamo}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_EDITAR')")
    public ResponseEntity<Void> registrarDevolucion(
            @PathVariable Long idPrestamo,
            @RequestParam String observacion) {

        service.registrarDevolucion(idPrestamo, observacion);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/por-pedido/{idPedido}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PRESTAMO_VER')")
    public ResponseEntity<java.util.List<PrestamoMaterialTrabajoModel>> listarPorPedido(@PathVariable Long idPedido) {
        return ResponseEntity.ok(service.listarPorPedido(idPedido));
    }

}
