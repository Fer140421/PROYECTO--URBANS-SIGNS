package com.example.urban_signs.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Category.CategorySimpleDTO;
import com.example.urban_signs.Model.CategorysModel;
import com.example.urban_signs.Model.MaterialProduccionModel;
import com.example.urban_signs.Services.CategoryService;
import com.example.urban_signs.Services.MaterialProduccionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoriaService;
    private final MaterialProduccionService materialService;

    @PostMapping("/register-cat")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_CREAR')")
    public ResponseEntity<?> registrar(@RequestBody CategorysModel categoria) {
        try {
            CategorysModel c = categoriaService.registrarCategoria(categoria);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/mod-cat/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_EDITAR')")
    public ResponseEntity<?> modificar(@PathVariable Long id, @RequestBody CategorysModel categoria) {
        try {
            categoria.setIdCategoria(id);
            CategorysModel c = categoriaService.modificarCategoria(categoria);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("listCategory")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_VER')")
    public ResponseEntity<Page<CategorysModel>> listarCategorias(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nombre,
            @RequestParam(defaultValue = "todos") String estado // valores posibles: true, false, todos
    ) {
        Page<CategorysModel> categorias = categoriaService.listarCategorias(nombre, estado, page, size);
        return ResponseEntity.ok(categorias);
    }

    @DeleteMapping("/Del-cat/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_ELIMINAR')")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok("Categoría eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/categories-simple")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_VER')")
    public ResponseEntity<List<CategorySimpleDTO>> getSimpleCategories() {
        return ResponseEntity.ok(categoriaService.getSimpleCategories());
    }

    // En CategoryController

    @GetMapping("/check-materials/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_VER')")
    public ResponseEntity<Map<String, Object>> checkMaterialsInCategory(@PathVariable Long id) {
        try {
            List<MaterialProduccionModel> materiales = materialService.findByCategoriaId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("tieneMateriales", !materiales.isEmpty());
            response.put("cantidadMateriales", materiales.size());
            response.put("materiales", materiales.stream()
                    .map(m -> {
                        Map<String, Object> materialMap = new HashMap<>();
                        materialMap.put("id", m.getIdMaterial());
                        materialMap.put("nombre", m.getNombre());
                        materialMap.put("caracteristica", m.getCaracteristica() != null ? m.getCaracteristica() : "");
                        materialMap.put("color", m.getColor() != null ? m.getColor() : "");
                        return materialMap;
                    })
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al verificar materiales: " + e.getMessage()));
        }
    }

    @PutMapping("/reassign-materials/{categoryId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('CATEGORIA_EDITAR')")
    public ResponseEntity<?> reassignMaterials(
            @PathVariable Long categoryId,
            @RequestBody Map<String, Long> request) {
        try {
            Long nuevaCategoriaId = request.get("nuevaCategoriaId");

            if (nuevaCategoriaId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Debe proporcionar una nueva categoría"));
            }

            if (categoryId.equals(nuevaCategoriaId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "La nueva categoría debe ser diferente a la actual"));
            }

            materialService.reasignarCategoria(categoryId, nuevaCategoriaId);

            return ResponseEntity.ok(Map.of("message", "Materiales reasignados correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al reasignar materiales: " + e.getMessage()));
        }
    }
}
