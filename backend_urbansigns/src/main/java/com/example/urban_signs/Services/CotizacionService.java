package com.example.urban_signs.Services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Cotizaciones.CotizacionRequest;
import com.example.urban_signs.DTO.Cotizaciones.ListDetalle.CotizacionDetalleDTO;
import com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion.ModificarCotizacionMod;
import com.example.urban_signs.DTO.Pedidos.confirmarPedidoList.ConfirmacionPedidoDTO;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;

public interface CotizacionService {
    Page<CotizacionModel> listar(Pageable pageable);

    void modificarTrabajosCotizacion(Long idCotizacion, ModificarCotizacionMod request);

    void eliminar(Long id);

    CotizacionModel registrarCotizacion(CotizacionRequest request);

    ConfirmacionPedidoDTO obtenerConfirmacionPedidoPorSolicitud(Long idSolicitud);

    Page<CotizacionModel> listarCotizaciones(Pageable pageable,
            EstadoCotizacion estado,
            String codCotizacion);

    CotizacionDetalleDTO obtenerDetallePorId(Long id);
}
