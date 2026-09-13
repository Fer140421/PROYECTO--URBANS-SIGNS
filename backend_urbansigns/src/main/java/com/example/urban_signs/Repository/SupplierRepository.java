package com.example.urban_signs.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.SupplierModel;

public interface SupplierRepository extends JpaRepository<SupplierModel, Long> {
  Optional<SupplierModel> findTopByOrderByIdSupplierDesc();

  Optional<SupplierModel> findByIdSupplier(Long idSupplier);

  @Query(value = """
                  SELECT s.* FROM suppliers s
      JOIN people p ON s.id_people = p.id_people
      WHERE (:status IS NULL OR s.status = :status)
        AND (
          :searchTerm IS NULL
          OR LOWER(CONCAT(p.name_people, ' ', p.ap, ' ', p.am)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          OR LOWER(p.ci) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        )
                  """, countQuery = """
                  SELECT COUNT(*) FROM suppliers s
      JOIN people p ON s.id_people = p.id_people
      WHERE (:status IS NULL OR s.status = :status)
        AND (
          :searchTerm IS NULL
          OR LOWER(CONCAT(p.name_people, ' ', p.ap, ' ', p.am)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          OR LOWER(p.ci) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        )
                  """, nativeQuery = true)
  Page<SupplierModel> findByFiltersUnified(
      @Param("status") Boolean status,
      @Param("searchTerm") String searchTerm,
      Pageable pageable);
}
