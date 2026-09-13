package com.example.urban_signs.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.urban_signs.Model.CategorysModel;

public interface CategorysRepository extends JpaRepository<CategorysModel, Long> {
    Optional<CategorysModel> findByNombreIgnoreCase(String nombre);

    Page<CategorysModel> findByEstado(Boolean estado, Pageable pageable);

    Page<CategorysModel> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    Page<CategorysModel> findByNombreContainingIgnoreCaseAndEstado(String nombre, Boolean estado, Pageable pageable);

    @Query("SELECT c.idCategoria, c.nombre FROM CategorysModel c WHERE c.estado = true")
    List<Object[]> findAllActiveCategoriesSimple();

}
