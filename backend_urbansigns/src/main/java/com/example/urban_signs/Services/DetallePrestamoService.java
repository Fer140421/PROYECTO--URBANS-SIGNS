package com.example.urban_signs.Services;

import java.util.List;

import com.example.urban_signs.Model.DetallePrestamoModel;

public interface DetallePrestamoService {
    DetallePrestamoModel registrar(DetallePrestamoModel detalle);

    DetallePrestamoModel modificar(Long id, DetallePrestamoModel detalle);

    void eliminar(Long id);

    List<DetallePrestamoModel> listar();

    DetallePrestamoModel obtenerPorId(Long id);
}