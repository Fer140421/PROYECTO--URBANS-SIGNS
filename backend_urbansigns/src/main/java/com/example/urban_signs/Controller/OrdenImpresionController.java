package com.example.urban_signs.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.OrdenImpresion.OrdenImpresionModificarDTO;
import com.example.urban_signs.DTO.OrdenImpresion.ordenImpresionRegistrarDTO;
import com.example.urban_signs.Model.OrdenImpresionModel;
import com.example.urban_signs.Services.OrdenImpresionService;
import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/ordenes-impresion")
@RequiredArgsConstructor
public class OrdenImpresionController {
    private final OrdenImpresionService ordenService;

    @PatchMapping(value = "/{id}/modificar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_EDITAR')")
    public ResponseEntity<?> modificarOrden(
            @PathVariable Long id,
            @RequestPart("orden") OrdenImpresionModificarDTO request,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        try {
            OrdenImpresionModel ordenActualizada = ordenService.modificarOrden(id, request, archivo);
            return ResponseEntity.ok(ordenActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al modificar la orden: " + e.getMessage());
        }
    }

    @PostMapping(value = "/registrar-orden-impresion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_CREAR')")
    public ResponseEntity<?> crearOrden(
            @RequestPart("orden") ordenImpresionRegistrarDTO request,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        try {
            ordenService.crearOrden(request, archivo);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar el archivo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al crear la orden: " + e.getMessage());
        }
    }

    @GetMapping("/listOrdenImpresion")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public Page<OrdenImpresionModel> obtenerOrdenesPaginadas(Pageable pageable) {
        return ordenService.obtenerOrdenesPaginadas(pageable);
    }

    @GetMapping("/detalle-orden-impresion/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<OrdenImpresionModel> obtenerPorId(@PathVariable Long id) {
        OrdenImpresionModel orden = ordenService.obtenerPorId(id);
        if (orden == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(orden);
    }

    @GetMapping("/{id}/descargar-archivo")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id) {
        try {
            Resource archivo = ordenService.descargarArchivo(id);
            String nombreArchivo = ordenService.obtenerNombreArchivo(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(archivo);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/cambiar-estado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_EDITAR')")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String estadoStr = request.get("estado");
            if (estadoStr == null || estadoStr.isEmpty()) {
                return ResponseEntity.badRequest().body("El estado es requerido");
            }

            estadoOrdenImpresion nuevoEstado;
            try {
                nuevoEstado = estadoOrdenImpresion.valueOf(estadoStr);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("Estado inválido: " + estadoStr);
            }

            OrdenImpresionModel ordenActualizada = ordenService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(ordenActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/por-estado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<Page<OrdenImpresionModel>> obtenerPorEstado(
            @RequestParam estadoOrdenImpresion estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaEmision").descending());
        Page<OrdenImpresionModel> ordenes = ordenService.obtenerPorEstado(estado, pageable);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/buscar")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<List<OrdenImpresionModel>> buscarOrdenes(
            @RequestParam String termino) {
        List<OrdenImpresionModel> ordenes = ordenService.buscarOrdenes(termino);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/estadisticas")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<Map<String, Long>> obtenerEstadisticas() {
        Map<String, Long> estadisticas = new HashMap<>();
        estadisticas.put("pendientes", ordenService.contarPorEstado(estadoOrdenImpresion.PENDIENTE));
        estadisticas.put("enProceso", ordenService.contarPorEstado(estadoOrdenImpresion.RECEPCIONADO));

        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/{id}/tiene-archivo")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('ORDEN_IMPRESION_VER')")
    public ResponseEntity<Map<String, Object>> tieneArchivo(@PathVariable Long id) {
        try {
            String nombreArchivo = ordenService.obtenerNombreArchivo(id);
            Map<String, Object> response = new HashMap<>();
            response.put("tieneArchivo", nombreArchivo != null);
            response.put("nombreArchivo", nombreArchivo);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
