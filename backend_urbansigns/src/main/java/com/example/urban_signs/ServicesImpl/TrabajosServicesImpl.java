package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Trabajos.RegistroTrabajoDTO;
import com.example.urban_signs.DTO.Trabajos.TrabajoSimpleDTO;
import com.example.urban_signs.Model.TrabajosModel;
import com.example.urban_signs.Repository.TrabajosRepository;
import com.example.urban_signs.Services.TrabajosService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrabajosServicesImpl implements TrabajosService {

    private final TrabajosRepository repository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    @Override
    public TrabajosModel crear(RegistroTrabajoDTO dto, MultipartFile file) {
        String imageUrl = cloudinaryService.uploadFile(file, CloudinaryFolder.TRABAJOS.getFolderName());

        TrabajosModel trabajo = new TrabajosModel();
        trabajo.setNombre(dto.getNombre());
        trabajo.setDescripcion(dto.getDescripcion());
        trabajo.setFoto(imageUrl);
        trabajo.setEstado(true);
        return repository.save(trabajo);
    }

    // ✅ Editar trabajo
    @Transactional
    @Override
    public TrabajosModel editar(Long id, RegistroTrabajoDTO dto, MultipartFile file) {
        TrabajosModel trabajo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));

        if (file != null && !file.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(file, CloudinaryFolder.TRABAJOS.getFolderName());
            trabajo.setFoto(imageUrl);
        }
        trabajo.setNombre(dto.getNombre());
        trabajo.setDescripcion(dto.getDescripcion());
        return repository.save(trabajo);
    }

    @Override
    public Page<TrabajosModel> listarConFiltros(String nombre, Boolean estado, Pageable pageable) {
        return repository.filtrar(nombre, estado, pageable);
    }

    // ✅ Listar solo id y nombre sin paginación
    @Override
    public List<TrabajoSimpleDTO> listarSimple() {
        return repository.findAll().stream()
                .map(t -> new TrabajoSimpleDTO(t.getIdTrabajo(), t.getNombre()))
                .toList();
    }

    @Transactional
    @Override
    public TrabajosModel eliminarLogico(Long id) {
        TrabajosModel trabajo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));
        trabajo.setEstado(false);
        return repository.save(trabajo);
    }

    @Transactional
    @Override
    public TrabajosModel activar(Long id) {
        TrabajosModel trabajo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado"));
        trabajo.setEstado(true);
        return repository.save(trabajo);
    }
}
