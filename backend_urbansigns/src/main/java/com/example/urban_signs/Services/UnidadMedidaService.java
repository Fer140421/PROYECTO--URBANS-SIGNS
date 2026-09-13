package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.Model.UnidadMedidaModel;

public interface UnidadMedidaService {
    Page<UnidadMedidaModel> listar(String nombre, Boolean estado, Pageable pageable);

    UnidadMedidaModel crear(UnidadMedidaModel unidadMedida);

    UnidadMedidaModel actualizar(Long id, UnidadMedidaModel unidadMedida);

    void eliminar(Long id);

    List<UnidadMedidaModel> findAll();
}