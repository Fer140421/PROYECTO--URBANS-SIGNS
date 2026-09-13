package com.example.urban_signs.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

import com.example.urban_signs.DTO.Pedidos.PedidoListDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoResumenDTO;
import com.example.urban_signs.DTO.Pedidos.completarPedido.CompletarPedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.PedidoCotizacionDTO;
import com.example.urban_signs.DTO.SeguimientoPedido.TrabajoDisponibleDTO;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Services.PedidosService;
import com.example.urban_signs.Services.PlanificacionSemanalService;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidosController {

    private final PedidosService pedidoService;
    private final PlanificacionSemanalService planificacionService;

    // En PedidosController.java

    @PostMapping("/generar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_CREAR')")
    public ResponseEntity<Void> generarPedido(@RequestBody PedidoRequestDTO request) {
        pedidoService.generarPedidoDesdeCotizacion(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listPedidos")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_VER')")
    public ResponseEntity<Page<PedidoListDTO>> listarPedidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idPedido") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) EstadoPedido estado // 👈 Nuevo parámetro
    ) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageRequest pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(pedidoService.listarPedidos(pageable, estado));
    }

    @GetMapping("/detalle-pedido/{idPedido}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_VER')")
    public ResponseEntity<PedidoCotizacionDTO> obtenerDetallePedido(@PathVariable Long idPedido) {
        PedidoCotizacionDTO detallePedido = pedidoService.obtenerDetallePedido(idPedido);
        return ResponseEntity.ok(detallePedido);
    }

    @PutMapping("/completar/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_EDITAR')")
    public ResponseEntity<?> completarPedido(
            @PathVariable Long id,
            @RequestBody CompletarPedidoRequestDTO request) {
        try {
            PedidoModel pedido = pedidoService.completarPedido(id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Pedido completado exitosamente",
                    "pedido", pedido));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()));
        }
    }

    @GetMapping("/pendientes")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_VER')")
    public ResponseEntity<List<PedidoResumenDTO>> obtenerPedidosPendientes() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosPendientes());
    }

    @GetMapping("/{idPedido}/trabajos-disponibles")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_VER')")
    public ResponseEntity<List<TrabajoDisponibleDTO>> obtenerTrabajosDelPedido(
            @PathVariable Long idPedido) {
        return ResponseEntity.ok(planificacionService.obtenerTrabajosDisponibles(idPedido));
    }

    @GetMapping("/listos-para-entrega")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_VER')")
    public ResponseEntity<List<com.example.urban_signs.DTO.Pedidos.entrega.PedidoListoEntregaDTO>> obtenerPedidosListosParaEntrega() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosListosParaEntrega());
    }

    @PostMapping(value = "/{id}/registrar-entrega", consumes = { "multipart/form-data" })
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PEDIDO_EDITAR')")
    public ResponseEntity<?> registrarEntrega(
            @PathVariable Long id,
            @RequestParam(value = "foto", required = false) org.springframework.web.multipart.MultipartFile foto,
            @RequestParam(value = "idEmpleado", required = false) Long idEmpleado,
            @RequestParam(value = "monto", required = false) java.math.BigDecimal monto,
            @RequestParam(value = "metodoPago", required = false) String metodoPago,
            @RequestParam(value = "observacion", required = false) String observacion,
            @RequestParam(value = "latitud", required = false) java.math.BigDecimal latitud,
            @RequestParam(value = "longitud", required = false) java.math.BigDecimal longitud) {
        try {
            PedidoModel pedido = pedidoService.registrarEntregaConFoto(
                    id, foto, idEmpleado, monto, metodoPago, observacion, latitud, longitud);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Entrega física registrada exitosamente",
                    "idPedido", pedido.getIdPedido(),
                    "estadoPedido", pedido.getEstadoPedido(),
                    "fotoEvidencia", pedido.getFotoEvidencia() != null ? pedido.getFotoEvidencia() : ""));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

}
