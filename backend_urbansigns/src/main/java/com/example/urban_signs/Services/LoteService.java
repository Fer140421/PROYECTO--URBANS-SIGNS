package com.example.urban_signs.Services;

import java.util.List;

import com.example.urban_signs.Model.LoteMaterialModel;

public interface LoteService {
    
    List<LoteMaterialModel> listarLotesPorMaterial(Long idMaterial);
}