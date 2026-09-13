package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.LoteMaterialModel;
import com.example.urban_signs.Repository.LoteRepository;
import com.example.urban_signs.Services.LoteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoteServiceImpl implements LoteService {
    private final LoteRepository loteMaterialRepository;

    @Override
    public List<LoteMaterialModel> listarLotesPorMaterial(Long idMaterial) {
        return loteMaterialRepository
                .findByMaterial_IdMaterialAndActivoTrueOrderByFechaIngresoAsc(idMaterial);
    }
}
