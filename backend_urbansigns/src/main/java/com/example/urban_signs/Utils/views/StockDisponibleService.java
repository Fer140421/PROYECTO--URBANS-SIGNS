package com.example.urban_signs.Utils.views;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockDisponibleService {

    private final StockDisponibleRepository repository;

    public Page<StockDisponible> listarStock(int page, int size, String nombre) {
        PageRequest pageable = PageRequest.of(page, size);

        if (nombre != null && !nombre.trim().isEmpty()) {
            return repository.findByNombreMaterialContainingIgnoreCase(nombre, pageable);
        } else {
            return repository.findAll(pageable);
        }
    }
}