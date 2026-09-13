package com.example.urban_signs.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
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

import com.example.urban_signs.DTO.Clientes.ClienteBusquedaDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Services.ClienteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClientesController {
    private final ClienteService clienteService;

    @GetMapping("/buscar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_VER')")
    public List<ClienteBusquedaDTO> buscarClientes(@RequestParam("q") String q) {
        return clienteService.buscarClientes(q);
    }

    @PostMapping("/registrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_CREAR')")
    public ResponseEntity<ClienteModel> registrarCliente(@RequestBody ClienteModel cliente) {
        return ResponseEntity.ok(clienteService.registrarCliente(cliente));
    }

    @PutMapping("/actualizar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_EDITAR')")
    public ResponseEntity<ClienteModel> actualizarCliente(
            @PathVariable Long id,
            @RequestBody ClienteModel cliente) {
        return ResponseEntity.ok(clienteService.actualizarCliente(id, cliente));
    }

    @GetMapping("/paginado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_VER')")
    public ResponseEntity<Page<ClienteModel>> listarClientesPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Boolean estado,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String categoria) {

        return ResponseEntity.ok(
                clienteService.listarClientesPaginados(page, size, nombre, estado, tipo, categoria));
    }

    @DeleteMapping("/eliminar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_ELIMINAR')")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/activar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_EDITAR')")
    public ResponseEntity<Void> activarCliente(@PathVariable Long id) {
        clienteService.activarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/cambiar-tipo/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CLIENTE_EDITAR')")
    public ResponseEntity<?> cambiarTipoCliente(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String nuevoTipo = request.get("tipoCliente");

            if (nuevoTipo == null || (!nuevoTipo.equals("normal") && !nuevoTipo.equals("destacado"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tipo de cliente inválido. Debe ser 'normal' o 'destacado'"));
            }

            ClienteModel cliente = clienteService.cambiarTipoCliente(id, nuevoTipo);

            return ResponseEntity.ok(Map.of(
                    "message", "Tipo de cliente actualizado correctamente",
                    "cliente", cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al cambiar tipo de cliente: " + e.getMessage()));
        }
    }
}
