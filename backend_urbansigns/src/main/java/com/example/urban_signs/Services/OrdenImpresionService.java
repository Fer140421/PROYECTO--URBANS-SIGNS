package com.example.urban_signs.Services;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.OrdenImpresion.OrdenImpresionModificarDTO;
import com.example.urban_signs.DTO.OrdenImpresion.ordenImpresionRegistrarDTO;
import com.example.urban_signs.Model.OrdenImpresionModel;
import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;

import org.springframework.core.io.Resource;

public interface OrdenImpresionService {
    OrdenImpresionModel crearOrden(ordenImpresionRegistrarDTO request, MultipartFile archivo) throws IOException;

    OrdenImpresionModel obtenerPorId(Long id);

    Page<OrdenImpresionModel> obtenerOrdenesPaginadas(Pageable pageable);

    Resource descargarArchivo(Long idOrden) throws IOException;

    OrdenImpresionModel cambiarEstado(Long idOrden, estadoOrdenImpresion nuevoEstado);

    Page<OrdenImpresionModel> obtenerPorEstado(estadoOrdenImpresion estado, Pageable pageable);

    List<OrdenImpresionModel> buscarOrdenes(String termino);

    Long contarPorEstado(estadoOrdenImpresion estado);

    String obtenerNombreArchivo(Long idOrden);

    OrdenImpresionModel modificarOrden(Long idOrden, OrdenImpresionModificarDTO request, MultipartFile archivo)
            throws IOException;

}