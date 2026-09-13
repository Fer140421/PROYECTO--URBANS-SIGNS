package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.urban_signs.DTO.Pedidos.PedidoListDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.PedidoResumenDTO;
import com.example.urban_signs.DTO.Pedidos.completarPedido.CompletarPedidoRequestDTO;
import com.example.urban_signs.DTO.Pedidos.detallePedido.PedidoCotizacionDTO;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

public interface PedidosService {
    PedidoModel generarPedidoDesdeCotizacion(PedidoRequestDTO request);

    Page<PedidoListDTO> listarPedidos(Pageable pageable, EstadoPedido estado);

    PedidoCotizacionDTO obtenerDetallePedido(Long idPedido);

    PedidoModel completarPedido(Long idPedido, CompletarPedidoRequestDTO request);

    List<PedidoResumenDTO> obtenerPedidosPendientes();

    List<com.example.urban_signs.DTO.Pedidos.entrega.PedidoListoEntregaDTO> obtenerPedidosListosParaEntrega();

    PedidoModel registrarEntregaConFoto(Long idPedido,
                                        org.springframework.web.multipart.MultipartFile foto,
                                        Long idEmpleado,
                                        java.math.BigDecimal monto,
                                        String metodoPago,
                                        String observacion,
                                        java.math.BigDecimal latitud,
                                        java.math.BigDecimal longitud);
}