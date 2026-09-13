package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.DTO.Dashboard.TopClienteDTO;
import com.example.urban_signs.Model.ClienteModel;

public interface ClienteRepository extends JpaRepository<ClienteModel, Long> {
  Optional<ClienteModel> findByUsuario_IdUser(Long idUser);

  Optional<ClienteModel> findByUsuario_UserAcces(String userAcces);

  boolean existsByUsuario_IdUser(Long idUser);

  @Query(value = """
      SELECT c.id_cliente AS idCliente,
             'Persona' AS tipo,
             CONCAT(p.name_people, ' ', COALESCE(p.ap,''), ' ', COALESCE(p.am,''), ' (CI: ', p.ci, ')') AS displayName
      FROM clientes c
      JOIN people p ON c.id_persona = p.id_people
      WHERE c.tipo_cliente_persona_empresa = 'Persona'
        AND (
            p.name_people ILIKE CONCAT('%', :busqueda, '%') OR
            p.ap ILIKE CONCAT('%', :busqueda, '%') OR
            p.am ILIKE CONCAT('%', :busqueda, '%') OR
            p.ci ILIKE CONCAT('%', :busqueda, '%') OR
            p.phone_number ILIKE CONCAT('%', :busqueda, '%')
        )

      UNION

      SELECT c.id_cliente AS idCliente,
             'Empresa' AS tipo,
             CONCAT(e.razon_social, ' (NIT: ', e.nit, ')') AS displayName
      FROM clientes c
      JOIN empresas e ON c.id_empresa = e.id_empresa
      WHERE c.tipo_cliente_persona_empresa = 'Empresa'
        AND (
            e.razon_social ILIKE CONCAT('%', :busqueda, '%') OR
            e.nit ILIKE CONCAT('%', :busqueda, '%') OR
            e.telefono ILIKE CONCAT('%', :busqueda, '%')
        )
      LIMIT 10
      """, nativeQuery = true)
  List<Object[]> buscarClientes(@Param("busqueda") String busqueda);

  @Query(value = """
        SELECT DISTINCT c.*
        FROM clientes c
        LEFT JOIN people p ON c.id_persona = p.id_people
        LEFT JOIN empresas e ON c.id_empresa = e.id_empresa
        WHERE
            (:nombre IS NULL OR
              (c.tipo_cliente_persona_empresa = 'Persona' AND
               (LOWER(p.name_people) LIKE LOWER(CONCAT('%', :nombre, '%')) OR
                LOWER(p.ap) LIKE LOWER(CONCAT('%', :nombre, '%')) OR
                LOWER(p.am) LIKE LOWER(CONCAT('%', :nombre, '%')))
              ) OR
              (c.tipo_cliente_persona_empresa = 'Empresa' AND
               LOWER(e.razon_social) LIKE LOWER(CONCAT('%', :nombre, '%')))
            )
            AND (:estado IS NULL OR c.estado = :estado)
            AND (:tipoPersonaEmpresa IS NULL OR c.tipo_cliente_persona_empresa = :tipoPersonaEmpresa)
            AND (:categoria IS NULL OR c.tipo_cliente = :categoria)
        ORDER BY c.id_cliente DESC
      """, countQuery = """
        SELECT COUNT(*)
        FROM clientes c
        LEFT JOIN people p ON c.id_persona = p.id_people
        LEFT JOIN empresas e ON c.id_empresa = e.id_empresa
        WHERE
            (:nombre IS NULL OR
              (c.tipo_cliente_persona_empresa = 'Persona' AND
               (LOWER(p.name_people) LIKE LOWER(CONCAT('%', :nombre, '%')) OR
                LOWER(p.ap) LIKE LOWER(CONCAT('%', :nombre, '%')) OR
                LOWER(p.am) LIKE LOWER(CONCAT('%', :nombre, '%')))
              ) OR
              (c.tipo_cliente_persona_empresa = 'Empresa' AND
               LOWER(e.razon_social) LIKE LOWER(CONCAT('%', :nombre, '%')))
            )
            AND (:estado IS NULL OR c.estado = :estado)
            AND (:tipoPersonaEmpresa IS NULL OR c.tipo_cliente_persona_empresa = :tipoPersonaEmpresa)
            AND (:categoria IS NULL OR c.tipo_cliente = :categoria)
      """, nativeQuery = true)
  Page<ClienteModel> filtrarClientes(
      @Param("nombre") String nombre,
      @Param("estado") Boolean estado,
      @Param("tipoPersonaEmpresa") String tipoPersonaEmpresa,
      @Param("categoria") String categoria,
      Pageable pageable);

  Long countByEstadoTrue();

  @Query(value = """
      SELECT
          CASE WHEN c.tipo_cliente_persona_empresa = 'Persona'
               THEN CONCAT(p.name_people, ' ', p.ap, ' ', COALESCE(p.am, ''))
               ELSE e.razon_social END AS nombre,
          c.tipo_cliente_persona_empresa AS tipo,
          COALESCE(SUM(ped.total), 0) AS total_compras,
          COUNT(ped.id_pedido) AS total_pedidos
      FROM clientes c
      LEFT JOIN people p ON c.id_persona = p.id_people
      LEFT JOIN empresas e ON c.id_empresa = e.id_empresa
      LEFT JOIN pedidos ped ON ped.id_cliente = c.id_cliente
      WHERE c.estado = true
      GROUP BY c.id_cliente, c.tipo_cliente_persona_empresa,
               p.name_people, p.ap, p.am, e.razon_social
      ORDER BY SUM(ped.total) DESC
      LIMIT 5
      """, nativeQuery = true)
  List<Object[]> findTopClientesNative();

}
