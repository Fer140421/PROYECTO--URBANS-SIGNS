package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Lotes.LoteMaterialDTO;
import com.example.urban_signs.Services.LoteService;
import com.example.urban_signs.Utils.Mappers.Lotes.LoteMaterialMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LotesController {

    private final LoteService loteMaterialService;

    @GetMapping("/material/{idMaterial}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('LOTE_VER')")
    public ResponseEntity<List<LoteMaterialDTO>> listarPorMaterial(
            @PathVariable Long idMaterial) {

        List<LoteMaterialDTO> lotes = loteMaterialService
                .listarLotesPorMaterial(idMaterial)
                .stream()
                .map(LoteMaterialMapper::toDTO)
                .toList();

        return ResponseEntity.ok(lotes);
    }

}
