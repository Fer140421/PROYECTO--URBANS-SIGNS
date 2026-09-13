package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.DetallePrestamoModel;
import com.example.urban_signs.Repository.DetallePrestamoRepository;
import com.example.urban_signs.Services.DetallePrestamoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DetallePrestamoServiceImpl implements DetallePrestamoService {

     private final DetallePrestamoRepository repository;

    @Override
    public DetallePrestamoModel registrar(DetallePrestamoModel detalle) {
        return repository.save(detalle);
    }

    @Override
    public DetallePrestamoModel modificar(Long id, DetallePrestamoModel detalle) {
        if (repository.existsById(id)) {
            detalle.setIdDetallePrestamo(id);
            return repository.save(detalle);
        }
        throw new RuntimeException("Detalle no encontrado");
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<DetallePrestamoModel> listar() {
        return repository.findAll();
    }

    @Override
    public DetallePrestamoModel obtenerPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Detalle no encontrado"));
    }
}
