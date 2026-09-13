package com.example.urban_signs.Services;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.Model.EmpresaModel;

public interface EmpresasService {
    Page<EmpresaModel> listar(Pageable pageable);

    Optional<EmpresaModel> obtenerPorId(Long id);

    EmpresaModel guardar(EmpresaModel empresa);

    EmpresaModel actualizar(Long id, EmpresaModel empresa);

    void eliminar(Long id);
}
