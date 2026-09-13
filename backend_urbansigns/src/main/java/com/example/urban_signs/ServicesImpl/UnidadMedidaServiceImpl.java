package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.UnidadMedidaModel;
import com.example.urban_signs.Repository.UnidadMedidaRepository;
import com.example.urban_signs.Services.UnidadMedidaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UnidadMedidaServiceImpl implements UnidadMedidaService {

    private final UnidadMedidaRepository unidadMedidaRepository;

    @Override
    public List<UnidadMedidaModel> findAll(){
        return unidadMedidaRepository.findAll();
    }

    @Override
    public Page<UnidadMedidaModel> listar(String nombre, Boolean estado, Pageable pageable) {
        return unidadMedidaRepository.filtrar(nombre, estado, pageable);
    }

    @Override
    public UnidadMedidaModel crear(UnidadMedidaModel unidadMedida) {
        return unidadMedidaRepository.save(unidadMedida);
    }

    @Override
    public UnidadMedidaModel actualizar(Long id, UnidadMedidaModel unidadMedida) {
        return unidadMedidaRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(unidadMedida.getNombre());
                    existing.setAbreviatura(unidadMedida.getAbreviatura());
                    return unidadMedidaRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada con id " + id));
    }

    @Override
    public void eliminar(Long id) {
        UnidadMedidaModel unidad = unidadMedidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidad de medida no encontrada con id: " + id));

        unidad.setEstado(false);
        unidadMedidaRepository.save(unidad);
    }

}
