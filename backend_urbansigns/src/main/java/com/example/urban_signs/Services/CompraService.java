package com.example.urban_signs.Services;

import org.springframework.data.domain.Page;

import com.example.urban_signs.DTO.Compras.Listado.CompraDTO;
import com.example.urban_signs.DTO.Compras.Registro.CompraRequestDTO;
import com.example.urban_signs.DTO.Compras.Registro.ConfirmarCompraDTO;
import com.example.urban_signs.Model.CompraModel;

public interface CompraService {
    CompraModel crearCompra(CompraRequestDTO dto);

    Page<CompraDTO> listarFiltradas(String estado, Long idCompra, Long idProveedor, int page, int size);

    CompraModel confirmarCompra(Long idCompra, ConfirmarCompraDTO dto);

    void eliminarDetalleCompra(Long idDetalle);

    CompraModel cancelarCompra(Long idCompra);

    CompraModel modificarCompra(Long idCompra, CompraRequestDTO dto);
}
