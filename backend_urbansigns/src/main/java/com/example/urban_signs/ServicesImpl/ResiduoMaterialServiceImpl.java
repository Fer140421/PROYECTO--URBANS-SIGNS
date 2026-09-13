package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Residuos.ResiduoMaterialDTO;
import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Model.ResiduoMaterialModel;
import com.example.urban_signs.Repository.LoteRepository;
import com.example.urban_signs.Repository.MaterialProduccionRepository;
import com.example.urban_signs.Repository.ResiduoMaterialRepository;
import com.example.urban_signs.Services.ResiduoMaterialService;
import com.example.urban_signs.Utils.Enum.EstadoResiduo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResiduoMaterialServiceImpl implements ResiduoMaterialService {

    private final ResiduoMaterialRepository repository;
    private final MaterialProduccionRepository materialRepository;
    private final LoteRepository loteRepository;

    @Override
    public ResiduoMaterialModel registrar(ResiduoMaterialDTO dto) {
        MaterialProduccionModel material = materialRepository.findById(dto.getIdMaterial())
                .orElseThrow(() -> new RuntimeException("Material con ID " + dto.getIdMaterial() + " no encontrado"));

        LoteMaterialModel lote = null;
        if (dto.getIdLoteOrigen() != null) {
            lote = loteRepository.findById(dto.getIdLoteOrigen())
                    .orElseThrow(() -> new RuntimeException("Lote con ID " + dto.getIdLoteOrigen() + " no encontrado"));
        }

        ResiduoMaterialModel residuo = ResiduoMaterialModel.builder()
                .material(material)
                .loteOrigen(lote)
                .cantidad(dto.getCantidad())
                .unidad(dto.getUnidad())
                .ubicacion(dto.getUbicacion())
                .estado(dto.getEstado() != null ? dto.getEstado() : EstadoResiduo.DISPONIBLE)
                .observaciones(dto.getObservaciones())
                .build();

        return repository.save(residuo);
    }

    @Override
    public ResiduoMaterialModel actualizar(Long id, ResiduoMaterialDTO dto) {
        ResiduoMaterialModel existente = obtenerPorId(id);

        if (dto.getIdMaterial() != null &&
                !dto.getIdMaterial().equals(existente.getMaterial().getIdMaterial())) {
            MaterialProduccionModel material = materialRepository.findById(dto.getIdMaterial())
                    .orElseThrow(
                            () -> new RuntimeException("Material con ID " + dto.getIdMaterial() + " no encontrado"));
            existente.setMaterial(material);
        }

        if (dto.getIdLoteOrigen() != null) {
            LoteMaterialModel lote = loteRepository.findById(dto.getIdLoteOrigen())
                    .orElseThrow(() -> new RuntimeException("Lote con ID " + dto.getIdLoteOrigen() + " no encontrado"));
            existente.setLoteOrigen(lote);
        } else {
            existente.setLoteOrigen(null);
        }

        existente.setCantidad(dto.getCantidad());
        existente.setUnidad(dto.getUnidad());
        existente.setUbicacion(dto.getUbicacion());
        existente.setEstado(dto.getEstado());
        existente.setObservaciones(dto.getObservaciones());

        return repository.save(existente);
    }

    @Override
    public ResiduoMaterialModel obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residuo no encontrado"));
    }

    @Override
    public List<ResiduoMaterialModel> listarTodos() {
        return repository.findAll();
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Page<ResiduoMaterialModel> listarPorMaterial(
            Long idMaterial,
            EstadoResiduo estado,
            Pageable pageable) {
        if (estado != null) {
            return repository.findByMaterial_IdMaterialAndEstado(
                    idMaterial, estado, pageable);
        }
        return repository.findByMaterial_IdMaterial(idMaterial, pageable);
    }

}