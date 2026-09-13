package com.example.urban_signs.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.urban_signs.Model.TrabajosModel;

public interface TrabajosRepository extends JpaRepository<TrabajosModel, Long> {

        @Query(value = "SELECT * FROM trabajos " +
                   "WHERE (:nombre IS NULL OR LOWER(nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
                   "AND (:estado IS NULL OR estado = :estado)",
           countQuery = "SELECT COUNT(*) FROM trabajos " +
                        "WHERE (:nombre IS NULL OR LOWER(nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
                        "AND (:estado IS NULL OR estado = :estado)",
           nativeQuery = true)
    Page<TrabajosModel> filtrar(@Param("nombre") String nombre,
                                @Param("estado") Boolean estado,
                                Pageable pageable);
}
