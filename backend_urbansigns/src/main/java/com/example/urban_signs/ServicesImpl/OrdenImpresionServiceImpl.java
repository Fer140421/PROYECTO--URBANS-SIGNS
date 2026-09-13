package com.example.urban_signs.ServicesImpl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.OrdenImpresion.OrdenImpresionModificarDTO;
import com.example.urban_signs.DTO.OrdenImpresion.ordenImpresionRegistrarDTO;
import com.example.urban_signs.Model.DetalleOrdenImpresionModel;
import com.example.urban_signs.Model.OrdenImpresionModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.OrdenImpresionRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.OrdenImpresionService;
import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;

import lombok.RequiredArgsConstructor;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.core.io.Resource;

@Service
@RequiredArgsConstructor
public class OrdenImpresionServiceImpl implements OrdenImpresionService {
    private final OrdenImpresionRepository ordenRepo;
    private final PedidosRepository pedidoRepo;
    private final UsersRepository usuaRepository;

    private static final String UPLOAD_DIR = "uploads/ordenes/";

    @Override
    public OrdenImpresionModel modificarOrden(Long idOrden, OrdenImpresionModificarDTO request, MultipartFile archivo)
            throws IOException {

        OrdenImpresionModel orden = ordenRepo.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (request.getObservaciones() != null) {
            orden.setObservaciones(request.getObservaciones());
        }
        if (archivo != null && !archivo.isEmpty()) {
            String rutaArchivo = guardarArchivo(archivo, orden.getNroOrden());
            orden.setArchivoAdjunto(rutaArchivo);
        }

        return ordenRepo.save(orden);
    }

    @Override
    public OrdenImpresionModel crearOrden(ordenImpresionRegistrarDTO request, MultipartFile archivo)
            throws IOException {
        // Generar número de orden secuencial
        String nroOrden = generarNumeroOrden();

        // Buscar entidades relacionadas
        PedidoModel pedido = pedidoRepo.findById(request.getIdPedido())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UsersModel usuarioLogueado = usuaRepository.findByUserAcces(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        LocalDateTime fechaActualLaPaz = LocalDateTime.now(ZoneId.of("America/La_Paz"));

        OrdenImpresionModel orden = OrdenImpresionModel.builder()
                .nroOrden(nroOrden)
                .pedido(pedido)
                .usuario(usuarioLogueado)
                .observaciones(request.getObservaciones())
                .fechaEmision(fechaActualLaPaz)
                .estado(estadoOrdenImpresion.PENDIENTE)
                .build();

        // Subir archivo si existe
        if (archivo != null && !archivo.isEmpty()) {
            String rutaArchivo = guardarArchivo(archivo, nroOrden);
            orden.setArchivoAdjunto(rutaArchivo);
        }

        // Guardar orden primero para obtener el ID
        orden = ordenRepo.save(orden);

        // Crear detalles
        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            OrdenImpresionModel ordenFinal = orden;
            List<DetalleOrdenImpresionModel> detalles = request.getDetalles().stream()
                    .map(dto -> DetalleOrdenImpresionModel.builder()
                            .orden(ordenFinal)
                            .idCotizacionTrabajo(dto.getIdCotizacionTrabajo())
                            .observaciones(dto.getObservaciones())
                            .build())
                    .collect(Collectors.toList());
            orden = ordenRepo.save(orden);
        }

        return orden;
    }

    private String generarNumeroOrden() {
        Optional<OrdenImpresionModel> ultimaOrden = ordenRepo.findLastOrden();

        if (ultimaOrden.isPresent()) {
            String ultimoNro = ultimaOrden.get().getNroOrden();
            // Formato: OI-00001
            int numero = Integer.parseInt(ultimoNro.substring(3));
            return String.format("OI-%05d", numero + 1);
        }

        return "OI-00001";
    }

    private String guardarArchivo(MultipartFile archivo, String nroOrden) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = archivo.getOriginalFilename()
                .substring(archivo.getOriginalFilename().lastIndexOf("."));
        String nombreArchivo = nroOrden + extension;
        Path filePath = uploadPath.resolve(nombreArchivo);

        Files.copy(archivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return filePath.toString();
    }

    @Override
    public Page<OrdenImpresionModel> obtenerOrdenesPaginadas(Pageable pageable) {
        return ordenRepo.findAll(pageable);
    }

    @Override
    public OrdenImpresionModel obtenerPorId(Long id) {
        return ordenRepo.findById(id).orElse(null);
    }

    @Override
    public Resource descargarArchivo(Long idOrden) throws IOException {
        OrdenImpresionModel orden = obtenerPorId(idOrden);

        if (orden.getArchivoAdjunto() == null || orden.getArchivoAdjunto().isEmpty()) {
            throw new RuntimeException("La orden no tiene archivo adjunto");
        }

        try {
            Path filePath = Paths.get(orden.getArchivoAdjunto()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Archivo no encontrado o no legible: " + orden.getArchivoAdjunto());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error al leer el archivo: " + e.getMessage());
        }
    }

    @Override
    public OrdenImpresionModel cambiarEstado(Long idOrden, estadoOrdenImpresion nuevoEstado) {
        OrdenImpresionModel orden = obtenerPorId(idOrden);

        // Validar estados permitidos
        List<String> estadosPermitidos = List.of("PENDIENTE", "RECEPCIONADO", "CANCELADO");
        if (!estadosPermitidos.contains(nuevoEstado)) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado);
        }

        orden.setEstado(nuevoEstado);
        return ordenRepo.save(orden);
    }

    @Override
    public Page<OrdenImpresionModel> obtenerPorEstado(estadoOrdenImpresion estado, Pageable pageable) {
        return ordenRepo.findByEstado(estado, pageable);
    }

    @Override
    public List<OrdenImpresionModel> buscarOrdenes(String termino) {
        return ordenRepo.findByNroOrdenContainingIgnoreCaseOrUsuario_UserAccesContainingIgnoreCase(
                termino, termino);
    }

    @Override
    public Long contarPorEstado(estadoOrdenImpresion estado) {
        return ordenRepo.countByEstado(estado);
    }

    @Override
    public String obtenerNombreArchivo(Long idOrden) {
        OrdenImpresionModel orden = obtenerPorId(idOrden);

        if (orden.getArchivoAdjunto() == null || orden.getArchivoAdjunto().isEmpty()) {
            return null;
        }

        Path path = Paths.get(orden.getArchivoAdjunto());
        return path.getFileName().toString();
    }
}
