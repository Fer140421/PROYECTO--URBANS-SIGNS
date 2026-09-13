package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Compras.Listado.CompraDTO;
import com.example.urban_signs.DTO.Compras.Listado.DetalleCompraLisDTO;
import com.example.urban_signs.DTO.Compras.Registro.CompraRequestDTO;
import com.example.urban_signs.DTO.Compras.Registro.ConfirmarCompraDTO;
import com.example.urban_signs.DTO.Compras.Registro.DetalleCompraDTO;
import com.example.urban_signs.Model.CompraModel;
import com.example.urban_signs.Model.DetalleCompraModel;
import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Model.MovimientoStockModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Projection.Compra.CompraProjection;
import com.example.urban_signs.Repository.CompraRepository;
import com.example.urban_signs.Repository.DetalleCompraRepository;
import com.example.urban_signs.Repository.LoteRepository;
import com.example.urban_signs.Repository.MaterialProduccionRepository;
import com.example.urban_signs.Repository.MovimientoStockRepository;
import com.example.urban_signs.Repository.SupplierRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.CompraService;
import com.example.urban_signs.Utils.Enum.EstadoCompra;
import com.example.urban_signs.Utils.Enum.TipoMovimiento;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

        private final CompraRepository compraRepository;
        private final SupplierRepository proveedorRepository;
        private final MaterialProduccionRepository materialRepository;
        private final DetalleCompraRepository detalleCompraRepository;
        private final MovimientoStockRepository movimientoStockRepository;
        private final UsersRepository usuarioRepository;
        private final LoteRepository loteRepository;

        @Override
        @Transactional
        public CompraModel crearCompra(CompraRequestDTO dto) {
                var proveedor = proveedorRepository.findById(dto.getIdProveedor())
                                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

                LocalDateTime fechaActualLaPaz = LocalDateTime.now(ZoneId.of("America/La_Paz"));

                CompraModel compra = new CompraModel();
                compra.setProveedor(proveedor);
                compra.setFecha(fechaActualLaPaz);
                compra.setEstado(EstadoCompra.PENDIENTE);
                compra.setObservaciones(dto.getObservaciones());

                List<DetalleCompraModel> detalles = dto.getDetalles().stream().map(d -> {
                        var material = materialRepository.findById(d.getIdMaterial())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Material no encontrado: " + d.getIdMaterial()));

                        DetalleCompraModel detalle = new DetalleCompraModel();
                        detalle.setCompra(compra);
                        detalle.setMaterial(material);
                        detalle.setCantidad(d.getCantidad());
                        detalle.setPrecioUnitario(d.getPrecioUnitario());
                        detalle.setSubtotal(d.getPrecioUnitario().multiply(d.getCantidad()));

                        return detalle;
                }).collect(Collectors.toList());

                // Calcular total
                BigDecimal total = detalles.stream()
                                .map(DetalleCompraModel::getSubtotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                compra.setDetalles(detalles);
                compra.setTotal(total);

                return compraRepository.save(compra);
        }

        @Override
        public Page<CompraDTO> listarFiltradas(String estado, Long idCompra, Long idProveedor, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());

                Page<CompraProjection> projections = compraRepository.findComprasFiltradas(estado, idCompra,
                                idProveedor, pageable);
                Map<Long, CompraDTO> comprasMap = new LinkedHashMap<>();

                projections.forEach(p -> {
                        comprasMap.computeIfAbsent(p.getIdCompra(), id -> {
                                CompraDTO dto = new CompraDTO(
                                                p.getIdCompra(),
                                                p.getNombreProveedor(),
                                                p.getIdProveedor(),
                                                p.getFecha(),
                                                p.getCity(),
                                                p.getEstado(),
                                                p.getTotal(),
                                                new ArrayList<>());
                                return dto;
                        }).detalles().add(new DetalleCompraLisDTO(
                                        p.getIdDetalle(),
                                        p.getIdMaterial(),
                                        p.getCantidad(),
                                        p.getPrecioUnitario(),
                                        p.getSubtotal(), null));
                });

                List<CompraDTO> content = new ArrayList<>(comprasMap.values());
                return new PageImpl<>(content, pageable, projections.getTotalElements());
        }

        @Override
        @Transactional
        public CompraModel confirmarCompra(Long idCompra, ConfirmarCompraDTO dto) {
                CompraModel compra = compraRepository.findById(idCompra)
                                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));

                if (compra.getEstado() == EstadoCompra.COMPLETADA) {
                        throw new RuntimeException("La compra ya fue confirmada anteriormente");
                }

                // Usuario logueado
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                UsersModel usuarioLogueado = usuarioRepository.findByUserAcces(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                // Obtener detalles de la compra
                List<DetalleCompraModel> detallesExistentes = compra.getDetalles();

                if (dto.getDetalles().size() != detallesExistentes.size()) {
                        throw new RuntimeException("La cantidad de detalles no coincide con la compra original");
                }

                BigDecimal total = BigDecimal.ZERO;

                // Procesar cada detalle
                for (int i = 0; i < detallesExistentes.size(); i++) {
                        DetalleCompraModel detalleExistente = detallesExistentes.get(i);
                        DetalleCompraDTO detalleDTO = dto.getDetalles().get(i);

                        if (!detalleExistente.getMaterial().getIdMaterial().equals(detalleDTO.getIdMaterial())) {
                                throw new RuntimeException("El material del detalle no coincide");
                        }

                        // Actualizar detalle
                        detalleExistente.setCantidad(detalleDTO.getCantidad());
                        detalleExistente.setPrecioUnitario(detalleDTO.getPrecioUnitario());
                        detalleExistente.setSubtotal(detalleDTO.getPrecioUnitario().multiply(detalleDTO.getCantidad()));

                        total = total.add(detalleExistente.getSubtotal());

                        // 🔹 Crear lote asociado a esta compra
                        LoteMaterialModel lote = new LoteMaterialModel();
                        lote.setMaterial(detalleExistente.getMaterial());
                        lote.setCompra(compra); // 👈 Relación con la compra
                        lote.setCantidadInicial(detalleDTO.getCantidad());
                        lote.setCantidadActual(detalleDTO.getCantidad());
                        lote.setFechaIngreso(LocalDateTime.now());
                        lote.setActivo(true);
                        lote.setUbicacion("Depósito principal");

                        // Generar código único
                        String codigo = "LOT-" + detalleExistente.getMaterial().getIdMaterial() + "-" +
                                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                        lote.setCodigoLote(codigo);

                        lote = loteRepository.save(lote);

                

                        // 🔹 Registrar movimiento de stock
                        MovimientoStockModel movimiento = new MovimientoStockModel();
                        movimiento.setMaterial(detalleExistente.getMaterial());
                        movimiento.setLote(lote);
                        movimiento.setCompra(compra);
                        movimiento.setUsuario(usuarioLogueado);
                        movimiento.setCantidad(detalleDTO.getCantidad());
                        movimiento.setTipoMovimiento(TipoMovimiento.COMPRA);
                        movimiento.setFecha(LocalDateTime.now());
                        movimiento.setDescripcion("Ingreso por compra #" + compra.getIdCompra());
                        movimientoStockRepository.save(movimiento);

                }

                // 🔹 Actualizar compra
                compra.setTotal(total);
                compra.setEstado(EstadoCompra.COMPLETADA);
                compra.setFecha(LocalDateTime.now());

                return compraRepository.save(compra);
        }

        @Transactional
        @Override
        public void eliminarDetalleCompra(Long idDetalle) {
                detalleCompraRepository.deleteById(idDetalle);
        }

        @Transactional
        @Override
        public CompraModel cancelarCompra(Long idCompra) {
                // Buscar la compra en la BD
                var compra = compraRepository.findById(idCompra)
                                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));

                // Validar que aún no esté cancelada o completada
                if (compra.getEstado() == EstadoCompra.CANCELADA) {
                        throw new RuntimeException("La compra ya fue cancelada");
                }
                if (compra.getEstado() == EstadoCompra.COMPLETADA) {
                        throw new RuntimeException("No se puede cancelar una compra ya completada");
                }

                compra.setEstado(EstadoCompra.CANCELADA);
                return compraRepository.save(compra);
        }

        @Override
        @Transactional
        public CompraModel modificarCompra(Long idCompra, CompraRequestDTO dto) {
                CompraModel compra = compraRepository.findById(idCompra)
                                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));

                var proveedor = proveedorRepository.findById(dto.getIdProveedor())
                                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

                compra.setProveedor(proveedor);
                compra.setObservaciones(dto.getObservaciones());

                // 1. Mapear los detalles existentes por material
                Map<Long, DetalleCompraModel> detallesExistentes = compra.getDetalles().stream()
                                .collect(Collectors.toMap(d -> d.getMaterial().getIdMaterial(), d -> d));

                List<DetalleCompraModel> nuevosDetalles = new ArrayList<>();

                for (DetalleCompraDTO d : dto.getDetalles()) {
                        var material = materialRepository.findById(d.getIdMaterial())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Material no encontrado: " + d.getIdMaterial()));

                        if (detallesExistentes.containsKey(d.getIdMaterial())) {
                                // Actualizar detalle existente
                                DetalleCompraModel detalleExistente = detallesExistentes.get(d.getIdMaterial());
                                detalleExistente.setCantidad(d.getCantidad());
                                detalleExistente.setPrecioUnitario(d.getPrecioUnitario());
                                detalleExistente.setSubtotal(d.getCantidad().multiply(d.getPrecioUnitario()));
                                nuevosDetalles.add(detalleExistente);
                        } else {
                                // Crear nuevo detalle
                                DetalleCompraModel nuevoDetalle = new DetalleCompraModel();
                                nuevoDetalle.setCompra(compra);
                                nuevoDetalle.setMaterial(material);
                                nuevoDetalle.setCantidad(d.getCantidad());
                                nuevoDetalle.setPrecioUnitario(d.getPrecioUnitario());
                                nuevoDetalle.setSubtotal(d.getCantidad().multiply(d.getPrecioUnitario()));
                                nuevosDetalles.add(nuevoDetalle);
                        }
                }

                // Reemplazar los detalles de la compra
                compra.setDetalles(nuevosDetalles);

                // Calcular total
                BigDecimal total = nuevosDetalles.stream()
                                .map(DetalleCompraModel::getSubtotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                compra.setTotal(total);

                return compraRepository.save(compra);
        }

}
