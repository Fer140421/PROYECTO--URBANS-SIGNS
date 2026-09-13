package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Dashboard.ActividadRecienteDTO;
import com.example.urban_signs.DTO.Dashboard.DashboardMetricasDTO;
import com.example.urban_signs.DTO.Dashboard.EstadoPedidosDTO;
import com.example.urban_signs.DTO.Dashboard.MaterialStockBajoDTO;
import com.example.urban_signs.DTO.Dashboard.MetricasProduccionDTO;
import com.example.urban_signs.DTO.Dashboard.ProximaEntregaDTO;
import com.example.urban_signs.DTO.Dashboard.TopClienteDTO;
import com.example.urban_signs.ServicesImpl.DashboardServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('DASHBOARD_VER')")
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    @GetMapping("/metricas-principales")
    public ResponseEntity<DashboardMetricasDTO> getMetricasPrincipales() {
        return ResponseEntity.ok(dashboardService.getMetricasPrincipales());
    }

    @GetMapping("/estado-pedidos")
    public ResponseEntity<EstadoPedidosDTO> getEstadoPedidos() {
        return ResponseEntity.ok(dashboardService.getEstadoPedidos());
    }

    
    @GetMapping("/materiales-stock-bajo")
    public ResponseEntity<List<MaterialStockBajoDTO>> getMaterialesStockBajo() {
        return ResponseEntity.ok(dashboardService.getMaterialesStockBajo());
    }

    @GetMapping("/proximas-entregas")
    public ResponseEntity<List<ProximaEntregaDTO>> getProximasEntregas() {
        return ResponseEntity.ok(dashboardService.getProximasEntregas());
    }

    @GetMapping("/top-clientes")
    public ResponseEntity<List<TopClienteDTO>> getTopClientes() {
        return ResponseEntity.ok(dashboardService.getTopClientes());
    }

 
    @GetMapping("/metricas-produccion")
    public ResponseEntity<MetricasProduccionDTO> getMetricasProduccion() {
        return ResponseEntity.ok(dashboardService.getMetricasProduccion());
    }

}
