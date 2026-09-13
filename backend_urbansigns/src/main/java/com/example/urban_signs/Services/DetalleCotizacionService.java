package com.example.urban_signs.Services;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.Model.DetalleCotizacionModel;

public interface DetalleCotizacionService {
    Page<DetalleCotizacionModel> listar(Pageable pageable);

    Optional<DetalleCotizacionModel> obtenerPorId(Long id);

    DetalleCotizacionModel guardar(DetalleCotizacionModel detalle);

    DetalleCotizacionModel actualizar(Long id, DetalleCotizacionModel detalle);

    void eliminar(Long id);
}
