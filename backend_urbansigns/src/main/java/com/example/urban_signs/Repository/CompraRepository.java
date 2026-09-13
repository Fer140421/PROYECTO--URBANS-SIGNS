package com.example.urban_signs.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.CompraModel;
import com.example.urban_signs.Projection.Compra.CompraProjection;

public interface CompraRepository extends JpaRepository<CompraModel, Long>, JpaSpecificationExecutor<CompraModel> {
  @Query(value = """
      SELECT
          c.id_compra AS idCompra,
          s.id_supplier AS idProveedor,
          (p.name_people || ' ' || p.ap || ' ' || p.am) AS nombreProveedor,
          c.fecha,
          s.city AS ciudadProveedor,
          c.estado AS estado,
          c.total AS total,
          d.id_detalle_compra AS idDetalle,
          m.id_material AS idMaterial,
          d.cantidad AS cantidad,
          d.precio_unitario AS precioUnitario,
          d.subtotal AS subtotal
      FROM compras c
      JOIN suppliers s ON c.id_proveedor = s.id_supplier
      JOIN people p ON s.id_people = p.id_people
      JOIN detalle_compras d ON c.id_compra = d.id_compra
      JOIN material_produccion m ON d.id_material = m.id_material
      WHERE (:estado IS NULL OR c.estado = :estado)
        AND (:idCompra IS NULL OR c.id_compra = :idCompra)
        AND (:idProveedor IS NULL OR s.id_supplier = :idProveedor)
      ORDER BY c.fecha DESC
      """, countQuery = """
      SELECT COUNT(DISTINCT c.id_compra)
      FROM compras c
      JOIN suppliers s ON c.id_proveedor = s.id_supplier
      JOIN people p ON s.id_people = p.id_people
      WHERE (:estado IS NULL OR c.estado = :estado)
        AND (:idCompra IS NULL OR c.id_compra = :idCompra)
        AND (:idProveedor IS NULL OR s.id_supplier = :idProveedor)
      """, nativeQuery = true)
  Page<CompraProjection> findComprasFiltradas(
      @Param("estado") String estado,
      @Param("idCompra") Long idCompra,
      @Param("idProveedor") Long idProveedor,
      Pageable pageable);

}
