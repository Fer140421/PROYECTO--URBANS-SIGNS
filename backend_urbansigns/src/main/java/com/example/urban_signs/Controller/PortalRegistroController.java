package com.example.urban_signs.Controller;

import java.time.LocalDate;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.urban_signs.DTO.Portal.PortalRegistroRequest;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.EmpresaModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Model.RolesModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.EmpresaRepository;
import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Repository.RolesRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.config.VerificationStorage;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/portal/registro")
@RequiredArgsConstructor
public class PortalRegistroController {
    private final UsersRepository users; private final PeopleRepository people; private final EmpresaRepository empresas;
    private final ClienteRepository clientes; private final RolesRepository roles; private final PasswordEncoder passwordEncoder;

    @PostMapping
    @Transactional
    public ResponseEntity<Void> registrar(@RequestBody PortalRegistroRequest r) {
        String email = limpio(r.email());
        if (email.isBlank() || r.password() == null || r.password().length() < 8 || !VerificationStorage.consumeVerified(email))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo debe verificarse antes de registrarse");
        if (users.existsByUserAcces(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
        boolean persona = "Persona".equalsIgnoreCase(r.tipoCliente());
        if (persona && (limpio(r.ci()).isBlank() || people.existsByCi(limpio(r.ci())))) throw new ResponseStatusException(HttpStatus.CONFLICT, "El CI ya está registrado");
        if (!persona && (limpio(r.nit()).isBlank() || empresas.existsByNit(limpio(r.nit())))) throw new ResponseStatusException(HttpStatus.CONFLICT, "El NIT ya está registrado");
        PeopleModel p = persona ? people.save(PeopleModel.builder().ci(limpio(r.ci())).name_people(limpio(r.namePeople())).ap(limpio(r.ap())).am(limpio(r.am())).phone_number(limpio(r.phone())).addres(limpio(r.direccion())).build()) : null;
        EmpresaModel e = persona ? null : empresas.save(EmpresaModel.builder().razonSocial(limpio(r.razonSocial())).nit(limpio(r.nit())).telefono(limpio(r.phone())).direccion(limpio(r.direccion())).build());
        RolesModel rol = roles.findByNameRoleIgnoreCase("Cliente").orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No existe el rol Cliente"));
        UsersModel u = users.save(UsersModel.builder().idPeople(p == null ? null : p.getId_people()).userAcces(email).passwordAcces(passwordEncoder.encode(r.password())).state_user(true).roles(Set.of(rol)).build());
        clientes.save(ClienteModel.builder().persona(p).empresa(e).usuario(u).tipoClientePersonaEmpresa(persona ? "Persona" : "Empresa").tipoCliente("normal").estado(true).fechaRegistro(LocalDate.now()).correo(email).build());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    private String limpio(String value) { return value == null ? "" : value.trim(); }
}
