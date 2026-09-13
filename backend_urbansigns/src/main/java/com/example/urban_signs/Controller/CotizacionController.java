package com.example.urban_signs.Controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.urban_signs.DTO.Cotizaciones.CotizacionRequest;
import com.example.urban_signs.DTO.Cotizaciones.cotizacionDTO;
import com.example.urban_signs.DTO.Cotizaciones.ListDetalle.CotizacionDetalleDTO;
import com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion.ModificarCotizacionMod;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.ConfirmacionPedidoDTO;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Services.CotizacionService;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cotizaciones")
@RequiredArgsConstructor
public class CotizacionController {
    private final CotizacionService cotizacionService;

    @PostMapping("/registrar")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_CREAR')")
    public ResponseEntity<Void> registrarCotizacion(@RequestBody CotizacionRequest request) {
        CotizacionModel cotizacion = cotizacionService.registrarCotizacion(request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/modificar-trabajos/{idCotizacion}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_EDITAR')")
    public ResponseEntity<Void> modificarTrabajosCotizacion(
            @PathVariable Long idCotizacion,
            @RequestBody ModificarCotizacionMod request) {
        cotizacionService.modificarTrabajosCotizacion(idCotizacion, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/confirmacion/{idSolicitud}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_VER')")
    public ResponseEntity<ConfirmacionPedidoDTO> obtenerConfirmacionPedido(@PathVariable Long idSolicitud) {
        ConfirmacionPedidoDTO confirmacion = cotizacionService.obtenerConfirmacionPedidoPorSolicitud(idSolicitud);
        return ResponseEntity.ok(confirmacion);
    }

    @GetMapping("/detalles-cotizacion/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_VER')")
    public ResponseEntity<CotizacionDetalleDTO> obtenerDetalleCotizacion(@PathVariable Long id) {
        CotizacionDetalleDTO detalle = cotizacionService.obtenerDetallePorId(id);
        return ResponseEntity.ok(detalle);
    }

    @GetMapping("/listar")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_VER')")
    public Page<cotizacionDTO> listarCotizaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam EstadoCotizacion estado,
            @RequestParam(required = false) String codCotizacion) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CotizacionModel> cotizaciones = cotizacionService.listarCotizaciones(pageable, estado, codCotizacion);
        return cotizaciones.map(this::convertirADTO);
    }

    private cotizacionDTO convertirADTO(CotizacionModel model) {
        return new cotizacionDTO(
                model.getIdCotizacion(),
                model.getCodCotizacion(),
                model.getSolicitud(),
                model.getFechaEmision(),
                model.getFechaCaducado(),
                model.getCostoTotal(),
                model.getEstado());
    }

}
