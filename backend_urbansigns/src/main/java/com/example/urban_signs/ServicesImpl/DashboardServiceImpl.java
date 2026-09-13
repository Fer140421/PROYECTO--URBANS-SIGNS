package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Dashboard.ActividadRecienteDTO;
import com.example.urban_signs.DTO.Dashboard.DashboardMetricasDTO;
import com.example.urban_signs.DTO.Dashboard.EstadoPedidosDTO;
import com.example.urban_signs.DTO.Dashboard.MaterialStockBajoDTO;
import com.example.urban_signs.DTO.Dashboard.MetricasProduccionDTO;
import com.example.urban_signs.DTO.Dashboard.ProximaEntregaDTO;
import com.example.urban_signs.DTO.Dashboard.TopClienteDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.CotizacionRepository;
import com.example.urban_signs.Repository.LoteRepository;
import com.example.urban_signs.Repository.MaterialProduccionRepository;
import com.example.urban_signs.Repository.MaterialTrabajoRepository;
import com.example.urban_signs.Repository.OrdenImpresionRepository;
import com.example.urban_signs.Repository.PagosPedidoRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.example.urban_signs.Repository.TrabajoProgramadoRepository;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
import com.example.urban_signs.Utils.Enum.EstadoTrabajoProgramado;
import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl {

    private final PedidosRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final MaterialProduccionRepository materialRepository;
    private final LoteRepository loteRepository;
    private final OrdenImpresionRepository ordenImpresionRepository;
    private final TrabajoProgramadoRepository trabajoProgramadoRepository;
    private final MaterialTrabajoRepository herramientaRepository;
    private final CotizacionRepository cotizacionRepository;
    private final PagosPedidoRepository pagoRepository;

    @Autowired
    public Long getTotalPedidos() {
        return pedidoRepository.count();
    }

    @Autowired
    public BigDecimal getVentasTotales() {
        return pedidoRepository.sumTotalVentas();
    }

    @Autowired
    public Long getClientesActivos() {
        return clienteRepository.countByEstadoTrue();
    }

    @Autowired
    public Long getMaterialesStockCritico() {
        return materialRepository.countStockCritico();
    }

    @Autowired
    public DashboardMetricasDTO getMetricasPrincipales() {
        return DashboardMetricasDTO.builder()
                .totalPedidos(getTotalPedidos())
                .ventasTotales(getVentasTotales())
                .clientesActivos(getClientesActivos())
                .stockCritico(getMaterialesStockCritico())
                .build();
    }

    public EstadoPedidosDTO getEstadoPedidos() {
        return EstadoPedidosDTO.builder()
                .pendientes(pedidoRepository.countByEstadoPedido(EstadoPedido.PENDIENTE))
                .enProceso(pedidoRepository.countByEstadoPedido(EstadoPedido.EN_PROCESO))
                .finalizados(pedidoRepository.countByEstadoPedido(EstadoPedido.FINALIZADO))
                .entregados(pedidoRepository.countByEstadoPedido(EstadoPedido.ENTREGADO))
                .build();
    }

    public List<MaterialStockBajoDTO> getMaterialesStockBajo() {
        return materialRepository.findMaterialesStockBajo().stream()
                .map(this::convertirAStockBajoDTO)
                .collect(Collectors.toList());
    }

    private MaterialStockBajoDTO convertirAStockBajoDTO(MaterialProduccionModel m) {
        LoteMaterialModel lote = loteRepository.findByMaterialAndActivoTrue(m);

        return MaterialStockBajoDTO.builder()
                .nombre(m.getNombre())
                .foto(m.getFoto())
                .stockActual(lote.getCantidadActual())
                .stockMinimo(m.getStockMinimo())
                .unidad(m.getUnidad().getAbreviatura())
                .estado(determinarEstado(lote.getCantidadActual(), m.getStockMinimo()))
                .build();
    }

    private String determinarEstado(BigDecimal actual, BigDecimal minimo) {
        if (actual.compareTo(BigDecimal.ZERO) == 0) {
            return "AGOTADO";
        } else if (actual.compareTo(minimo) < 0) {
            return "BAJO STOCK";
        }
        return "NORMAL";
    }

    public List<ProximaEntregaDTO> getProximasEntregas() {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(7); // Próximos 7 días

        return pedidoRepository.findProximasEntregas(hoy, limite).stream()
                .map(this::convertirAProximaEntregaDTO)
                .collect(Collectors.toList());
    }

    private ProximaEntregaDTO convertirAProximaEntregaDTO(PedidoModel p) {
        return ProximaEntregaDTO.builder()
                .cliente(obtenerNombreCliente(p.getCliente()))
                .fechaEntrega(p.getFechaPedido().plusDays(5))
                .prioridad(determinarPrioridad(p))
                .build();
    }

    private String obtenerNombreCliente(ClienteModel cliente) {
        if (cliente == null) {
            return "Cliente desconocido";
        }

        // Si es tipo Persona
        if ("Persona".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())
                && cliente.getPersona() != null) {
            PeopleModel persona = cliente.getPersona();
            return String.format("%s %s %s",
                    persona.getName_people(),
                    persona.getAp() != null ? persona.getAp() : "",
                    persona.getAm() != null ? persona.getAm() : "").trim();
        }

        // Si es tipo Empresa
        if ("Empresa".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa())
                && cliente.getEmpresa() != null) {
            return cliente.getEmpresa().getRazonSocial();
        }

        return "Sin nombre";
    }

    private String determinarPrioridad(PedidoModel p) {
        LocalDate entrega = p.getFechaPedido().plusDays(5);
        long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), entrega);

        if (diasRestantes <= 2)
            return "ALTA";
        if (diasRestantes <= 5)
            return "MEDIA";
        return "BAJA";
    }

    public List<TopClienteDTO> getTopClientes() {
        return clienteRepository.findTopClientesNative().stream()
                .map(row -> TopClienteDTO.builder()
                        .nombre((String) row[0])
                        .tipo((String) row[1])
                        .totalCompras((BigDecimal) row[2])
                        .totalPedidos(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }



    private String convertirEstado(String estadoOriginal) {
        switch (estadoOriginal) {
            case "PENDIENTE":
                return "PENDIENTE";
            case "EN_PROCESO":
                return "EN_PROCESO";
            case "FINALIZADO":
            case "ENTREGADO":
            case "APROBADA":
                return "COMPLETADO";
            default:
                return "PENDIENTE";
        }
    }

    public MetricasProduccionDTO getMetricasProduccion() {
        return MetricasProduccionDTO.builder()
                .ordenesImpresion(ordenImpresionRepository.countByEstado(estadoOrdenImpresion.PENDIENTE) +
                        ordenImpresionRepository.countByEstado(estadoOrdenImpresion.RECEPCIONADO))
                .trabajosProgramados(trabajoProgramadoRepository.countByEstado(EstadoTrabajoProgramado.PENDIENTE) +
                        trabajoProgramadoRepository.countByEstado(EstadoTrabajoProgramado.EN_PROCESO))
                .herramientasEnUso(herramientaRepository.countByEstadoActual(EstadoHerramienta.EN_USO))
                .tiempoPromedio(3.2) // ✅ VALOR FIJO TEMPORAL
                .build();
    }

}