package com.example.urban_signs.ServicesImpl;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Category.CategorySimpleDTO;
import com.example.urban_signs.Model.CategorysModel;
import com.example.urban_signs.Repository.CategorysRepository;
import com.example.urban_signs.Services.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategorysRepository categoriaRepository;

    private String normalizarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty())
            return null;

        String sinTildes = Normalizer.normalize(nombre.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String nombreLower = sinTildes.toLowerCase();
        return nombreLower.substring(0, 1).toUpperCase() + nombreLower.substring(1);
    }

    @Override
    public CategorysModel registrarCategoria(CategorysModel categoria) throws Exception {
        String nombreNormalizado = normalizarNombre(categoria.getNombre());
        if (nombreNormalizado == null || nombreNormalizado.isEmpty()) {
            throw new Exception("El nombre de la categoría es obligatorio.");
        }

        Optional<CategorysModel> existente = categoriaRepository.findByNombreIgnoreCase(nombreNormalizado);
        if (existente.isPresent()) {
            throw new Exception("Ya existe una categoría con ese nombre.");
        }

        categoria.setNombre(nombreNormalizado);
        CategorysModel categoriaGuardada = categoriaRepository.save(categoria);

        return categoriaGuardada;
    }

    @Override
    public CategorysModel modificarCategoria(CategorysModel categoria) throws Exception {
        if (categoria.getIdCategoria() == null) {
            throw new Exception("El id de la categoría es obligatorio para modificar.");
        }

        Optional<CategorysModel> catExistente = categoriaRepository.findById(categoria.getIdCategoria());
        if (!catExistente.isPresent()) {
            throw new Exception("La categoría a modificar no existe.");
        }

        String nombreNormalizado = normalizarNombre(categoria.getNombre());
        Optional<CategorysModel> otroConMismoNombre = categoriaRepository.findByNombreIgnoreCase(nombreNormalizado);

        if (otroConMismoNombre.isPresent()
                && !otroConMismoNombre.get().getIdCategoria().equals(categoria.getIdCategoria())) {
            throw new Exception("Ya existe otra categoría con ese nombre.");
        }

        CategorysModel c = catExistente.get();
        c.setNombre(nombreNormalizado);
        c.setDescripcion(categoria.getDescripcion());
        c.setEstado(categoria.getEstado());

        CategorysModel categoriaActualizada = categoriaRepository.save(c);

        return categoriaActualizada;
    }

    @Override
    public Page<CategorysModel> listarCategorias(String nombre, String estado, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("idCategoria").descending());

        if (estado.equalsIgnoreCase("todos")) {
            if (nombre != null && !nombre.isEmpty()) {
                return categoriaRepository.findByNombreContainingIgnoreCase(nombre, pageable);
            } else {
                return categoriaRepository.findAll(pageable);
            }
        } else {
            Boolean estadoBool = Boolean.parseBoolean(estado);
            if (nombre != null && !nombre.isEmpty()) {
                return categoriaRepository.findByNombreContainingIgnoreCaseAndEstado(nombre, estadoBool, pageable);
            } else {
                return categoriaRepository.findByEstado(estadoBool, pageable);
            }
        }
    }

    public void eliminarCategoria(Long idCategoria) throws Exception {
        Optional<CategorysModel> catExistente = categoriaRepository.findById(idCategoria);
        if (!catExistente.isPresent()) {
            throw new Exception("La categoría a eliminar no existe.");
        }

        categoriaRepository.deleteById(idCategoria);
    }

    public List<CategorySimpleDTO> getSimpleCategories() {
        List<Object[]> results = categoriaRepository.findAllActiveCategoriesSimple();
        List<CategorySimpleDTO> dtos = new ArrayList<>();
        for (Object[] row : results) {
            Long id = (Long) row[0];
            String nombre = (String) row[1];
            dtos.add(new CategorySimpleDTO(id, nombre));
        }
        return dtos;
    }

}
