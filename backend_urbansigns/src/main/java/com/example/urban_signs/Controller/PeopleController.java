package com.example.urban_signs.Controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Services.PeopleServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/people")
@RequiredArgsConstructor
public class PeopleController {
    private final PeopleServices peopleServices;

    @GetMapping("/listPeople")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PERSONA_VER')")
    public List<PeopleModel> findAll() {
        return peopleServices.findAll();
    }

    @PostMapping("/save")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PERSONA_CREAR')")
    public PeopleModel save(@RequestBody PeopleModel peopleModel) {
        return peopleServices.save(peopleModel);
    }

    @PutMapping("/people/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PERSONA_EDITAR')")
    public PeopleModel mod(@PathVariable Long id, @RequestBody PeopleModel peopleModel) {
        return peopleServices.update(id, peopleModel);
    }

    @DeleteMapping("/del/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('PERSONA_ELIMINAR')")
    public ResponseEntity<?> eliminarPersona(@PathVariable Long id) {
        boolean eliminado = peopleServices.eliminarPersona(id);
        if (eliminado) {
            return ResponseEntity.ok("Persona eliminada correctamente.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}

