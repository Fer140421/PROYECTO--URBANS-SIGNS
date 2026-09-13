package com.example.urban_signs.Services;
import org.springframework.data.domain.Page;
import com.example.urban_signs.DTO.Prestamo.PrestamoDTO;
import com.example.urban_signs.DTO.Prestamo.RegistrarPrestamoDTO;
import com.example.urban_signs.Model.PrestamoMaterialTrabajoModel;

public interface PrestamoMaterialTrabajoService {
    PrestamoMaterialTrabajoModel registrar(RegistrarPrestamoDTO dto);

    PrestamoMaterialTrabajoModel modificar(Long idPrestamo, RegistrarPrestamoDTO dto);

    void eliminar(Long id);

    PrestamoMaterialTrabajoModel obtenerPorId(Long id);

    Page<PrestamoDTO> listarPrestamos(String estado, String tipoPrestamo, int page, int size);
    PrestamoMaterialTrabajoModel registrarDevolucion(Long idPrestamo, String observacion);
    java.util.List<PrestamoMaterialTrabajoModel> listarPorPedido(Long idPedido);
}