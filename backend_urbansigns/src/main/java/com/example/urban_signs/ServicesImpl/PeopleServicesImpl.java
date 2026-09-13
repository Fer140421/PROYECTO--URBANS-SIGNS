package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Services.PeopleServices;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PeopleServicesImpl implements PeopleServices {

    private final PeopleRepository peopleRepository;

    @Override
    public List<PeopleModel> findAll() {
        return peopleRepository.findAll();
    }

    @Override
    public PeopleModel save(PeopleModel peopleModel) {
        return peopleRepository.save(peopleModel);
    }

    @Override
    public PeopleModel update(Long id, PeopleModel peopleModel) {
        peopleModel.setId_people(id);
        return peopleRepository.save(peopleModel);
    }

    @Override
    public boolean eliminarPersona(Long id) {
        if (peopleRepository.existsById(id)) {
            peopleRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

}
