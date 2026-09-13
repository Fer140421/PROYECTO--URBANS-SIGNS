package com.example.urban_signs.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.PrestamoMaterialTrabajoModel;
import com.example.urban_signs.Projection.Prestamo.PrestamoProjection;

public interface PrestamoMaterialTrabajoRepository extends JpaRepository<PrestamoMaterialTrabajoModel, Long> {
    @Query(value = """
            SELECT
                p.id_prestamo AS idPrestamo,
                p.id_pedido AS idPedido,
                emp.id_employee AS idEmpleado,
                per.name_people AS nombrePersona,
                per.ap AS apellidoPaterno,
                per.am AS apellidoMaterno,
                p.fecha_prestamo AS fechaPrestamo,
                p.fecha_devolucion AS fechaDevolucion,
                p.tipo_prestamo AS tipoPrestamo,
                p.estado AS estado,
                p.observacion AS observacion,
                d.id_herramienta AS idHerramienta,
                h.nombre AS nombreHerramienta,
                h.foto AS fotoHerramienta,
                h.codigo AS codigoHerramienta,
                h.marca AS marcaHerramienta,
                h.modelo AS modeloHerramienta
            FROM prestamos_material_trabajo p
            JOIN employees emp ON p.id_empleado = emp.id_employee
            JOIN people per ON emp.id_people = per.id_people
            JOIN detalle_prestamo d ON p.id_prestamo = d.id_prestamo
            JOIN herramientas h ON d.id_herramienta = h.id_herramienta
            WHERE (:estado IS NULL OR p.estado = :estado)
              AND (:tipoPrestamo IS NULL OR p.tipo_prestamo = :tipoPrestamo)
            ORDER BY p.fecha_prestamo DESC
            """, countQuery = """
            SELECT COUNT(DISTINCT p.id_prestamo)
            FROM prestamos_material_trabajo p
            WHERE (:estado IS NULL OR p.estado = :estado)
              AND (:tipoPrestamo IS NULL OR p.tipo_prestamo = :tipoPrestamo)
            """, nativeQuery = true)
    Page<PrestamoProjection> findByEstadoAndTipoPrestamo(
            @Param("estado") String estado,
            @Param("tipoPrestamo") String tipoPrestamo,
            Pageable pageable);

    java.util.List<PrestamoMaterialTrabajoModel> findByPedido_IdPedido(Long idPedido);
}