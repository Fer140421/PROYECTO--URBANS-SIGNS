package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.RolesModel;
import com.example.urban_signs.Repository.RolesRepository;
import com.example.urban_signs.Services.RolesServices;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolesServicesImpl implements RolesServices {

    private final RolesRepository rolesRepository;

    @Override
    public List<RolesModel> findAll() {
        return rolesRepository.findAll();
    }
}
