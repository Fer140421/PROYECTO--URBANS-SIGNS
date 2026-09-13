package com.example.urban_signs.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import com.example.urban_signs.Model.RolesModel;

public interface RolesRepository extends JpaRepository<RolesModel, Long> {
    @Query("SELECT r FROM RolesModel r WHERE LOWER(r.name_role) = LOWER(:nameRole)")
    Optional<RolesModel> findByNameRoleIgnoreCase(@Param("nameRole") String nameRole);

}
