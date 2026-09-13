package com.example.urban_signs.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.EmpresaModel;

public interface EmpresaRepository extends JpaRepository <EmpresaModel, Long> {
    boolean existsByNit(String nit);

}
