package com.example.urban_signs.Services;

import java.util.List;

import com.example.urban_signs.Model.PeopleModel;

public interface PeopleServices {

    List<PeopleModel> findAll();
    PeopleModel save(PeopleModel peopleModel);
    PeopleModel update(Long id,PeopleModel peopleModel);
    boolean eliminarPersona(Long id);
    //PeopleModel del(PeopleModel peopleModel);
}
