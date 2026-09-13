package com.example.urban_signs.ServicesImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.MaterialTrabajo.HerramientaListDTO;
import com.example.urban_signs.DTO.MaterialTrabajo.MaterialTrabajoRegistrarDTO;
import com.example.urban_signs.Model.HerramientasModel;
import com.example.urban_signs.Projection.MaterialesTrabajo.MaterialListProjection;
import com.example.urban_signs.Repository.MaterialTrabajoRepository;
import com.example.urban_signs.Services.MaterialTrabajoService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MaterialTrabajoServiceImpl implements MaterialTrabajoService {

    private final MaterialTrabajoRepository repository;
    private final CloudinaryService cloudinaryService;

    @Override
    public Page<HerramientaListDTO> listAllConFiltros(
            int page, int size,String  activo, String filtroTexto) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id_herramienta").descending());

        Page<HerramientasModel> herramientas = repository.buscarPorActivoYNombreOCodigo(
                activo,
                (filtroTexto != null && !filtroTexto.isBlank()) ? filtroTexto : null,
                pageable);

        return herramientas.map(h -> new HerramientaListDTO(
                h.getIdHerramienta(),
                h.getCodigo(),
                h.getFoto(),
                h.getNombre(),
                h.getMarca(),
                h.getModelo(),
                h.getUbicacion(),
                h.getEstadoActual().name(),
                h.getObservaciones(),
                h.getActivo()));
    }

    @Override
    public Optional<HerramientasModel> getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    @Override
    public HerramientasModel save(MaterialTrabajoRegistrarDTO dto, MultipartFile file) {
        String codigo = generarCodigo();
        String imageUrl = cloudinaryService.uploadFile(file, CloudinaryFolder.HERRAMIENTAS_TRABAJO.getFolderName());
        HerramientasModel herramienta = new HerramientasModel();
        herramienta.setCodigo(codigo);
        herramienta.setFoto(imageUrl);
        herramienta.setNombre(dto.getNombre());
        herramienta.setMarca(dto.getMarca());
        herramienta.setModelo(dto.getModelo());
        herramienta.setEstadoActual(EstadoHerramienta.DISPONIBLE);
        herramienta.setUbicacion(dto.getUbicacion());
        herramienta.setObservaciones(dto.getObservaciones());
        herramienta.setActivo(true);

        return repository.save(herramienta);
    }

    private String generarCodigo() {
        Long count = repository.count() + 1;
        return String.format("HERR-%04d", count);
    }

    @Transactional
    @Override
    public HerramientasModel update(Long id, MaterialTrabajoRegistrarDTO dto, MultipartFile file) {
        return repository.findById(id).map(existing -> {
            existing.setNombre(dto.getNombre());
            existing.setMarca(dto.getMarca());
            existing.setModelo(dto.getModelo());
            existing.setUbicacion(dto.getUbicacion());
            existing.setObservaciones(dto.getObservaciones());
            if (file != null && !file.isEmpty()) {
                String imageUrl = cloudinaryService.uploadFile(file,
                        CloudinaryFolder.HERRAMIENTAS_TRABAJO.getFolderName());
                existing.setFoto(imageUrl);
            }
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Herramienta no encontrada con id: " + id));
    }

    @Transactional
    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("MaterialTrabajo no encontrado con id: " + id);
        }
        repository.deleteById(id);
    }

    public List<MaterialListProjection> obtenerMaterialesActivos() {
        return repository.findMaterialesActivos();
    }

    @Transactional
    @Override
    public HerramientasModel actualizarEstado(Long id, EstadoHerramienta estado) {
        HerramientasModel herramienta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Herramienta no encontrada"));

        herramienta.setEstadoActual(estado);

        if (estado == EstadoHerramienta.DADO_DE_BAJA) {
            herramienta.setActivo(false);
        }

        if(estado==EstadoHerramienta.DISPONIBLE){
            herramienta.setActivo(true);
        }

        return repository.save(herramienta);
    }

}