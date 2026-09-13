package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.MaterialProduccion.MaterialProduccionDTO;
import com.example.urban_signs.DTO.MaterialProduccion.MaterialStatsDTO;
import com.example.urban_signs.DTO.MaterialProduccion.RegistroMaterialDTO;
import com.example.urban_signs.Model.CategorysModel;
import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Model.MovimientoStockModel;
import com.example.urban_signs.Model.UnidadMedidaModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.CategorysRepository;
import com.example.urban_signs.Repository.LoteRepository;
import com.example.urban_signs.Repository.MaterialProduccionRepository;
import com.example.urban_signs.Repository.MovimientoStockRepository;
import com.example.urban_signs.Repository.UnidadMedidaRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.MaterialProduccionService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;
import com.example.urban_signs.Utils.Enum.TipoControl;
import com.example.urban_signs.Utils.Enum.TipoMovimiento;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MaterialProduccionServiceImpl implements MaterialProduccionService {

        private final MaterialProduccionRepository repository;
        private final UnidadMedidaRepository unidadMedidaRepository;
        private final CategorysRepository categorysRepository;
        private final CloudinaryService cloudinaryService;
        private final MovimientoStockRepository movimientoStockRepository;
        private final UsersRepository usuarioRepository;
        private final LoteRepository loteMaterialService;

        public Page<MaterialProduccionModel> listar(String nombre, Boolean estado, Pageable pageable) {
                return repository.filtrar(nombre, estado, pageable);
        }

        @Transactional
        public MaterialProduccionModel guardar(RegistroMaterialDTO dto, MultipartFile file) {
                validarDTO(dto);
                UnidadMedidaModel unidad = unidadMedidaRepository.findById(dto.getIdUnidad())
                                .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada"));

                CategorysModel categoria = categorysRepository.findById(dto.getIdCategoria())
                                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                UsersModel usuarioLogueado = usuarioRepository.findByUserAcces(username)
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                String imageUrl = cloudinaryService.uploadFile(file,
                                CloudinaryFolder.MATERIALES_PRODUCCION.getFolderName());

                LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));

                MaterialProduccionModel material = new MaterialProduccionModel();
                material.setUnidad(unidad);
                material.setCategoria(categoria);
                material.setNombre(dto.getNombre());
                material.setCaracteristica(dto.getCaracteristica());
                material.setColor(dto.getColor());
                material.setFoto(imageUrl);
                material.setFechaCreacion(fechaActualLaPaz);
                material.setEstado(true);

                // ✨ NUEVO: Configurar tipo de control
                material.setTipoControl(dto.getTipoControl());

                // ✨ NUEVO: Configurar según tipo de control
                if (material.getTipoControl() == TipoControl.ROLLO) {
                        material.setAnchoRollo(dto.getAnchoRollo());
                        material.setLargoRolloNuevo(dto.getLargoRolloNuevo());
                } else if (material.getTipoControl() == TipoControl.PLANCHA) {
                        material.setAnchoPlancha(dto.getAnchoPlancha());
                        material.setAltoPlancha(dto.getAltoPlancha());
                        // m2PorPlancha se calcula automáticamente en @PrePersist
                }

                // ✨ NUEVO: Configuración de stock
                material.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : BigDecimal.ZERO);
                material.setPorcentajeDesperdicio(
                                dto.getPorcentajeDesperdicio() != null ? dto.getPorcentajeDesperdicio()
                                                : new BigDecimal("10.00"));

                material = repository.save(material);

                // 5️⃣ Si tiene cantidad inicial, crear el lote y registros
                if (dto.getCantidadInicial() != null && dto.getCantidadInicial().compareTo(BigDecimal.ZERO) > 0) {
                        registrarStockInicial(material, dto, usuarioLogueado);
                }

                return material;
        }

        private void registrarStockInicial(MaterialProduccionModel material,
                        RegistroMaterialDTO dto,
                        UsersModel usuario) {

                // Crear el lote inicial
                LocalDateTime fechaActualLaPaz = LocalDateTime.now(ZoneId.of("America/La_Paz"));
                LoteMaterialModel lote = new LoteMaterialModel();
                lote.setMaterial(material);
                lote.setCantidadInicial(dto.getCantidadInicial());
                lote.setCantidadActual(dto.getCantidadInicial());
                lote.setFechaIngreso(fechaActualLaPaz);
                lote.setActivo(true);
                lote.setUbicacion(dto.getUbicacion() != null ? dto.getUbicacion() : "Sin ubicación");

                if (material.getTipoControl() == TipoControl.ROLLO) {
                        lote.setAnchoRollo(material.getAnchoRollo());
                }

                String codigo = "LOT-" + material.getIdMaterial() + "-" +
                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                lote.setCodigoLote(codigo);

                lote = loteMaterialService.save(lote);


                // Crear el movimiento de stock (auditoría)
                MovimientoStockModel movimiento = new MovimientoStockModel();
                movimiento.setMaterial(material);
                movimiento.setLote(lote);
                movimiento.setUsuario(usuario);
                movimiento.setCantidad(dto.getCantidadInicial());
                movimiento.setTipoMovimiento(TipoMovimiento.COMPRA);
                movimiento.setFecha(fechaActualLaPaz);
                movimiento.setDescripcion("Stock inicial al crear el material");
                movimientoStockRepository.save(movimiento);
        }

        private void validarDTO(RegistroMaterialDTO dto) {
                if (dto.getTipoControl() == null) {
                        dto.setTipoControl(TipoControl.UNIDAD); // Por defecto
                }

                // Validar campos específicos según tipo de control
                if (dto.getTipoControl() == TipoControl.ROLLO) {
                        if (dto.getAnchoRollo() == null || dto.getAnchoRollo().compareTo(BigDecimal.ZERO) <= 0) {
                                throw new IllegalArgumentException(
                                                "Para materiales tipo ROLLO debe especificar el ancho del rollo");
                        }
                }

                if (dto.getTipoControl() == TipoControl.PLANCHA) {
                        if (dto.getAnchoPlancha() == null || dto.getAltoPlancha() == null) {
                                throw new IllegalArgumentException(
                                                "Para materiales tipo PLANCHA debe especificar ancho y alto de la plancha");
                        }
                }

                // Validar cantidad inicial si existe
                if (dto.getCantidadInicial() != null && dto.getCantidadInicial().compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("La cantidad inicial no puede ser negativa");
                }
        }

        @Transactional
        public MaterialProduccionModel actualizar(Long id, MaterialProduccionDTO dto, MultipartFile file) {
                return repository.findById(id).map(existente -> {

                        UnidadMedidaModel unidad = unidadMedidaRepository.findById(dto.getIdUnidad())
                                        .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada"));

                        CategorysModel categoria = categorysRepository.findById(dto.getIdCategoria())
                                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

                        existente.setUnidad(unidad);
                        existente.setCategoria(categoria);
                        existente.setNombre(dto.getNombre());
                        existente.setCaracteristica(dto.getCaracteristica());
                        existente.setColor(dto.getColor());
                        if (file != null && !file.isEmpty()) {
                                String imageUrl = cloudinaryService.uploadFile(file,
                                                CloudinaryFolder.MATERIALES_PRODUCCION.getFolderName());
                                existente.setFoto(imageUrl);
                        }

                        return repository.save(existente);
                }).orElseThrow(() -> new RuntimeException("MaterialProduccion no encontrado con id: " + id));
        }

        public void eliminar(Long id) {
                MaterialProduccionModel material = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Material no encontrado con id: " + id));
                material.setEstado(false);
                repository.save(material);
        }

        @Override
        public List<MaterialProduccionModel> findAll() {
                return repository.findAll();
        }

        public MaterialStatsDTO getMaterialStats() {
                Object result = repository.getMaterialStatsRaw();

                Object[] row = (Object[]) result;

                long totalMateriales = ((Number) row[0]).longValue();
                long totalEnStock = ((Number) row[1]).longValue();
                long totalBajoStock = ((Number) row[2]).longValue();
                long totalAgotados = ((Number) row[3]).longValue();

                MaterialStatsDTO dto = new MaterialStatsDTO();
                dto.setTotalMateriales(totalMateriales);
                dto.setTotalEnStock(totalEnStock);
                dto.setTotalBajoStock(totalBajoStock);
                dto.setTotalAgotados(totalAgotados);

                // Calculamos porcentajes
                if (totalMateriales > 0) {
                        dto.setPorcentajeEnStock(Math.round((totalEnStock * 100.0) / totalMateriales));
                        dto.setPorcentajeBajoStock(Math.round((totalBajoStock * 100.0) / totalMateriales));
                        dto.setPorcentajeAgotados(Math.round((totalAgotados * 100.0) / totalMateriales));
                } else {
                        dto.setPorcentajeEnStock(0);
                        dto.setPorcentajeBajoStock(0);
                        dto.setPorcentajeAgotados(0);
                }

                return dto;
        }

        @Override
        public List<MaterialProduccionModel> findByCategoriaId(Long categoriaId) {
                return repository.findByCategoriaIdCategoria(categoriaId);
        }

        @Override
        @Transactional
        public void reasignarCategoria(Long categoriaActualId, Long nuevaCategoriaId) {
                CategorysModel nuevaCategoria = categorysRepository.findById(nuevaCategoriaId)
                                .orElseThrow(() -> new RuntimeException("Categoría destino no encontrada"));

                if (!nuevaCategoria.getEstado()) {
                        throw new RuntimeException("La categoría destino debe estar activa");
                }
                List<MaterialProduccionModel> materiales = findByCategoriaId(categoriaActualId);
                materiales.forEach(material -> {
                        material.setCategoria(nuevaCategoria);
                        repository.save(material);
                });
        }
}