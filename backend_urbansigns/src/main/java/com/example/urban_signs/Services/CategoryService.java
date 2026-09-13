package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;

import com.example.urban_signs.DTO.Category.CategorySimpleDTO;
import com.example.urban_signs.Model.CategorysModel;

public interface CategoryService {
    CategorysModel registrarCategoria(CategorysModel categoria) throws Exception;

    CategorysModel modificarCategoria(CategorysModel categoria) throws Exception;

    Page<CategorysModel> listarCategorias(String nombre, String estado, int page, int size);

    void eliminarCategoria(Long idCategoria) throws Exception;

    List<CategorySimpleDTO> getSimpleCategories();
}
