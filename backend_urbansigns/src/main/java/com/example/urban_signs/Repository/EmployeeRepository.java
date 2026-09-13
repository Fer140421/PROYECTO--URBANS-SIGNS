package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Projection.Empleados.ListEmpleadosProjection;

public interface EmployeeRepository extends JpaRepository<EmployeeModel, Long> {
  Page<EmployeeModel> findByStatus(Boolean status, Pageable pageable);

  Optional<EmployeeModel> findByIdEmployee(Long idEmployee);

  @Query(value = """
            SELECT e.* FROM employees e
      JOIN people p ON e.id_people = p.id_people
      WHERE (:status IS NULL OR e.status = :status)
        AND (
          :searchTerm IS NULL
          OR LOWER(CONCAT(p.name_people, ' ', p.ap, ' ', p.am)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          OR LOWER(p.ci) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        )
      ORDER BY p.name_people ASC, p.ap ASC, p.am ASC
            """, countQuery = """
            SELECT COUNT(*) FROM employees e
      JOIN people p ON e.id_people = p.id_people
      WHERE (:status IS NULL OR e.status = :status)
        AND (
          :searchTerm IS NULL
          OR LOWER(CONCAT(p.name_people, ' ', p.ap, ' ', p.am)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          OR LOWER(p.ci) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        )
            """, nativeQuery = true)
  Page<EmployeeModel> findByFiltersUnified(
      @Param("status") Boolean status,
      @Param("searchTerm") String searchTerm,
      Pageable pageable);

  @Query(value = "SELECT e.id_employee AS idEmployee, " +
      "CONCAT(p.name_people, ' ', p.ap, ' ', p.am) AS fullName " +
      "FROM employees e " +
      "JOIN people p ON e.id_people = p.id_people " +
      "WHERE e.status = true " +
      "ORDER BY p.name_people ASC, p.ap ASC, p.am ASC", nativeQuery = true)
  List<ListEmpleadosProjection> ListEmpleadosProjection();

  @Query(value = """
      SELECT
          CONCAT(p.name_people, ' ', p.ap, ' ', COALESCE(p.am, '')) as nombreCompleto,
          u.state_user as estadoUsuario,
          u.user_acces as usuario,
          u.id_user as idUsuario,
          e.foto as foto
      FROM employees e
      INNER JOIN people p ON e.id_people = p.id_people
      LEFT JOIN users u ON u.id_people = p.id_people
      WHERE e.status = true
      AND (
          CONCAT(p.name_people, ' ', p.ap, ' ', COALESCE(p.am, '')) ILIKE CONCAT('%', :searchTerm, '%')
          OR p.name_people ILIKE CONCAT('%', :searchTerm, '%')
          OR p.ap ILIKE CONCAT('%', :searchTerm, '%'))
      AND (:estadoUsuario IS NULL OR u.state_user = :estadoUsuario)
      ORDER BY p.name_people ASC, p.ap ASC, p.am ASC
      """, nativeQuery = true)
  Page<Object[]> findEmployeeListWithFilters(
      @Param("searchTerm") String searchTerm,
      @Param("estadoUsuario") Boolean estadoUsuario,
      Pageable pageable);

  @Query("SELECT e FROM EmployeeModel e " +
      "JOIN UsersModel u ON u.idPeople = e.people.id_people " +
      "WHERE u.userAcces = :username AND e.status = true")
  Optional<EmployeeModel> findByUsername(@Param("username") String username);

}
