package com.example.urban_signs.ServicesImpl;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.EmpresaModel;
import com.example.urban_signs.Repository.EmpresaRepository;
import com.example.urban_signs.Services.EmpresasService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmpresaServiceImpl implements EmpresasService {

    private final EmpresaRepository empresaRepository;

  
 @Override
    public Page<EmpresaModel> listar(Pageable pageable) {
        return empresaRepository.findAll(pageable);
    }

    @Override
    public Optional<EmpresaModel> obtenerPorId(Long id) {
        return empresaRepository.findById(id);
    }

    @Override
    public EmpresaModel guardar(EmpresaModel empresa) {
        return empresaRepository.save(empresa);
    }

    @Override
    public EmpresaModel actualizar(Long id, EmpresaModel empresa) {
        return empresaRepository.findById(id).map(e -> {
            e.setRazonSocial(empresa.getRazonSocial());
            e.setNit(empresa.getNit());
            e.setDireccion(empresa.getDireccion());
            e.setTelefono(empresa.getTelefono());
            return empresaRepository.save(e);
        }).orElseThrow(() -> new RuntimeException("Empresa no encontrada con id: " + id));
    }

    @Override
    public void eliminar(Long id) {
        empresaRepository.deleteById(id);
    }
}
