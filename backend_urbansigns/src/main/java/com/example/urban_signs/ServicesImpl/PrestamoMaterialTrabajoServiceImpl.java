package com.example.urban_signs.ServicesImpl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Prestamo.DetallePrestamoDTO;
import com.example.urban_signs.DTO.Prestamo.PrestamoDTO;
import com.example.urban_signs.DTO.Prestamo.RegistrarPrestamoDTO;
import com.example.urban_signs.DTO.Prestamo.RegistroDetalleDTO;
import com.example.urban_signs.Model.DetallePrestamoModel;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Model.HerramientasModel;
import com.example.urban_signs.Model.PrestamoMaterialTrabajoModel;
import com.example.urban_signs.Projection.Prestamo.PrestamoProjection;
import com.example.urban_signs.Repository.DetallePrestamoRepository;
import com.example.urban_signs.Repository.MaterialTrabajoRepository;
import com.example.urban_signs.Repository.PrestamoMaterialTrabajoRepository;
import com.example.urban_signs.Services.PrestamoMaterialTrabajoService;
import com.example.urban_signs.Services.SesionAccionService;
import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrestamoMaterialTrabajoServiceImpl implements PrestamoMaterialTrabajoService {

    private final PrestamoMaterialTrabajoRepository repository;
    private final DetallePrestamoRepository detalleRepository;
    private final MaterialTrabajoRepository herramientasRepository;
    private final SesionAccionService sesionAccionService;
    private final com.example.urban_signs.Repository.PedidosRepository pedidoRepository;

    @Transactional
    @Override
    public PrestamoMaterialTrabajoModel registrar(RegistrarPrestamoDTO dto) {

        PrestamoMaterialTrabajoModel prestamo = new PrestamoMaterialTrabajoModel();

        EmployeeModel empleado = new EmployeeModel();
        empleado.setIdEmployee(dto.getIdEmpleado());
        prestamo.setEmpleado(empleado);

        if (dto.getIdPedido() != null) {
            pedidoRepository.findById(dto.getIdPedido()).ifPresent(prestamo::setPedido);
        }
        if (dto.getObservacion() != null) {
            prestamo.setObservacion(dto.getObservacion());
        }

        prestamo.setFechaPrestamo(LocalDateTime.now(ZoneId.of("America/La_Paz")));
        prestamo.setTipo_prestamo(dto.getTipoPrestamo());
        prestamo.setEstado("Prestado");

        PrestamoMaterialTrabajoModel prestamoGuardado = repository.save(prestamo);

  

        for (RegistroDetalleDTO detDto : dto.getDetalles()) {

            HerramientasModel herramienta = herramientasRepository.findById(detDto.getIdHerramienta())
                    .orElseThrow(() -> new RuntimeException("Herramienta no encontrada"));
            herramienta.setEstadoActual(EstadoHerramienta.EN_USO);

            DetallePrestamoModel detalle = new DetallePrestamoModel();
            detalle.setPrestamo(prestamoGuardado);
            detalle.setHerramienta(herramienta);

            detalleRepository.save(detalle);
        }

        return prestamoGuardado;
    }

    @Transactional
    @Override
    public PrestamoMaterialTrabajoModel modificar(Long idPrestamo, RegistrarPrestamoDTO dto) {
        PrestamoMaterialTrabajoModel prestamo = repository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con id: " + idPrestamo));
        EmployeeModel empleado = new EmployeeModel();
        empleado.setIdEmployee(dto.getIdEmpleado());
        prestamo.setEmpleado(empleado);
        prestamo.setTipo_prestamo(dto.getTipoPrestamo());

        if (dto.getIdPedido() != null) {
            pedidoRepository.findById(dto.getIdPedido()).ifPresent(prestamo::setPedido);
        } else {
            prestamo.setPedido(null);
        }
        if (dto.getObservacion() != null) {
            prestamo.setObservacion(dto.getObservacion());
        }

        PrestamoMaterialTrabajoModel prestamoActualizado = repository.save(prestamo);
        detalleRepository.deleteAllByPrestamoId(prestamoActualizado.getIdPrestamo());
        for (RegistroDetalleDTO detDto : dto.getDetalles()) {
            DetallePrestamoModel detalle = new DetallePrestamoModel();
            detalle.setPrestamo(prestamoActualizado);
            HerramientasModel herramienta = new HerramientasModel();
            herramienta.setIdHerramienta(detDto.getIdHerramienta());
            detalle.setHerramienta(herramienta);
            detalleRepository.save(detalle);
        }
        return prestamoActualizado;
    }

    @Override
    public List<PrestamoMaterialTrabajoModel> listarPorPedido(Long idPedido) {
        return repository.findByPedido_IdPedido(idPedido);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public PrestamoMaterialTrabajoModel obtenerPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
    }

    @Override
    public Page<PrestamoDTO> listarPrestamos(String estado, String tipoPrestamo, int page, int size) {
        Page<PrestamoProjection> projections = repository.findByEstadoAndTipoPrestamo(
                estado,
                tipoPrestamo,
                PageRequest.of(page, size));

        Map<Long, PrestamoDTO> prestamosMap = new LinkedHashMap<>();

        projections.forEach(p -> {
            String nombreCompleto = p.getNombrePersona() + " " + p.getApellidoPaterno() + " " + p.getApellidoMaterno();

            prestamosMap
                    .computeIfAbsent(p.getIdPrestamo(), id -> new PrestamoDTO(
                            p.getIdPrestamo(),
                            p.getIdPedido(),
                            p.getIdEmpleado(),
                            nombreCompleto,
                            p.getFechaPrestamo(),
                            p.getFechaDevolucion(),
                            p.getTipoPrestamo(),
                            p.getEstado(),
                            p.getObservacion(),
                            new ArrayList<>()))
                    .getDetalles()
                    .add(new DetallePrestamoDTO(
                            p.getIdHerramienta(),
                            p.getNombreHerramienta(),
                            p.getFotoHerramienta(),
                            p.getCodigoHerramienta(),
                            p.getMarcaHerramienta(),
                            p.getModeloHerramienta()));
        });

        List<PrestamoDTO> content = new ArrayList<>(prestamosMap.values());
        return new PageImpl<>(content, projections.getPageable(), projections.getTotalElements());
    }

    @Transactional
    @Override
    public PrestamoMaterialTrabajoModel registrarDevolucion(Long idPrestamo, String observacion) {

        PrestamoMaterialTrabajoModel prestamo = repository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Prestamo no encontrado con id: " + idPrestamo));
        prestamo.setEstado("Entregado");
        prestamo.setObservacion(observacion);
        prestamo.setFechaDevolucion(
                LocalDateTime.now(ZoneId.of("America/La_Paz")));
        List<DetallePrestamoModel> detalles = detalleRepository.findByPrestamoIdPrestamo(idPrestamo);

        for (DetallePrestamoModel detalle : detalles) {
            HerramientasModel herramienta = detalle.getHerramienta();
            herramienta.setEstadoActual(EstadoHerramienta.DISPONIBLE);
            herramientasRepository.save(herramienta);
        }
        return repository.save(prestamo);
    }

}