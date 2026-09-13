package com.example.urban_signs.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.urban_signs.Model.PeopleModel;

public interface PeopleRepository extends JpaRepository<PeopleModel, Long>{
    boolean existsByCi(String ci);

}
