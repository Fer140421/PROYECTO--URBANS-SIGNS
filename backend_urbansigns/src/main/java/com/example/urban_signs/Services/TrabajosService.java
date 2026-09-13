package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Trabajos.RegistroTrabajoDTO;
import com.example.urban_signs.DTO.Trabajos.TrabajoSimpleDTO;
import com.example.urban_signs.Model.TrabajosModel;

public interface TrabajosService {

    TrabajosModel crear(RegistroTrabajoDTO dto, MultipartFile file);

    TrabajosModel editar(Long id, RegistroTrabajoDTO dto, MultipartFile file);

    Page<TrabajosModel> listarConFiltros(String nombre, Boolean estado, Pageable pageable);

    List<TrabajoSimpleDTO> listarSimple();

    TrabajosModel eliminarLogico(Long id);

    TrabajosModel activar(Long id);
}