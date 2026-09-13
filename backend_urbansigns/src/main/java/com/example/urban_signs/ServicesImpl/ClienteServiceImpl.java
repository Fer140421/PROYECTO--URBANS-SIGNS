package com.example.urban_signs.ServicesImpl;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.Clientes.ClienteBusquedaDTO;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.EmpresaModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Repository.ClienteRepository;
import com.example.urban_signs.Repository.EmpresaRepository;
import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.ClienteService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final PeopleRepository peopleRepository;
    private final UsersRepository usersRepository;

    @Override
    public ClienteModel registrarCliente(ClienteModel cliente) {
        if ((cliente.getPersona() == null && cliente.getEmpresa() == null) ||
                (cliente.getPersona() != null && cliente.getEmpresa() != null)) {
            throw new RuntimeException("Debe enviar solo Persona o Empresa");
        }
        if (cliente.getPersona() != null) {
            if (cliente.getPersona().getId_people() != null) {
                PeopleModel personaExistente = peopleRepository.findById(cliente.getPersona().getId_people())
                        .orElseThrow(() -> new RuntimeException("Persona no encontrada"));
                cliente.setPersona(personaExistente);
            } else {
                PeopleModel nuevaPersona = peopleRepository.save(cliente.getPersona());
                cliente.setPersona(nuevaPersona);
            }
            cliente.setTipoClientePersonaEmpresa("Persona");
        }

        if (cliente.getEmpresa() != null) {
            if (cliente.getEmpresa().getIdEmpresa() != null) {
                EmpresaModel empresaExistente = empresaRepository.findById(cliente.getEmpresa().getIdEmpresa())
                        .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
                cliente.setEmpresa(empresaExistente);
            } else {
                EmpresaModel nuevaEmpresa = empresaRepository.save(cliente.getEmpresa());
                cliente.setEmpresa(nuevaEmpresa);
            }
            cliente.setTipoClientePersonaEmpresa("Empresa");
        }

        if (cliente.getUsuario() != null) {
            Long idUsuario = cliente.getUsuario().getIdUser();
            if (idUsuario == null) {
                throw new RuntimeException("Debe indicar una cuenta existente para vincular al cliente");
            }
            if (clienteRepository.existsByUsuario_IdUser(idUsuario)) {
                throw new RuntimeException("La cuenta ya esta vinculada a otro cliente");
            }
            cliente.setUsuario(usersRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }

        LocalDate fechaActualLaPaz = LocalDate.now(ZoneId.of("America/La_Paz"));
        cliente.setFechaRegistro(fechaActualLaPaz);
        if (cliente.getEstado() == null) {
            cliente.setEstado(true);
        }

        if (cliente.getTipoCliente() == null || cliente.getTipoCliente().isBlank()) {
            cliente.setTipoCliente("normal");
        }

        return clienteRepository.save(cliente);
    }

    @Override
    public ClienteModel actualizarCliente(Long id, ClienteModel cliente) {
        ClienteModel existente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        existente.setTipoCliente(cliente.getTipoCliente());
        existente.setCorreo(cliente.getCorreo());
        existente.setEstado(cliente.getEstado());

        if ("Empresa".equals(existente.getTipoClientePersonaEmpresa())) {
            // Actualizar solo datos de empresa
            EmpresaModel empresaExistente = existente.getEmpresa();
            if (empresaExistente == null) {
                throw new RuntimeException("El cliente debería ser Empresa, pero no tiene datos de empresa");
            }
            empresaExistente.setRazonSocial(cliente.getEmpresa().getRazonSocial());
            empresaExistente.setNit(cliente.getEmpresa().getNit());
            empresaExistente.setDireccion(cliente.getEmpresa().getDireccion());
            empresaExistente.setTelefono(cliente.getEmpresa().getTelefono());
            empresaRepository.save(empresaExistente);
        } else if ("Persona".equals(existente.getTipoClientePersonaEmpresa())) {
            // Actualizar solo datos de persona
            PeopleModel personaExistente = existente.getPersona();
            if (personaExistente == null) {
                throw new RuntimeException("El cliente debería ser Persona, pero no tiene datos de persona");
            }
            personaExistente.setCi(cliente.getPersona().getCi());
            personaExistente.setName_people(cliente.getPersona().getName_people());
            personaExistente.setAp(cliente.getPersona().getAp());
            personaExistente.setAm(cliente.getPersona().getAm());
            personaExistente.setPhone_number(cliente.getPersona().getPhone_number());
            peopleRepository.save(personaExistente);
        }

        return clienteRepository.save(existente);
    }

    @Override
    public ClienteModel obtenerClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Override
    public Page<ClienteModel> listarClientesPaginados(
            int page,
            int size,
            String nombre,
            Boolean estado,
            String tipoPersonaEmpresa,
            String categoria) {
        Pageable pageable = PageRequest.of(page, size);
        return clienteRepository.filtrarClientes(nombre, estado, tipoPersonaEmpresa, categoria, pageable);
    }

    @Override
    public void eliminarCliente(Long id) {
        ClienteModel cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setEstado(false);
        clienteRepository.save(cliente);
    }

    @Override
    public List<ClienteBusquedaDTO> buscarClientes(String busqueda) {
        List<Object[]> results = clienteRepository.buscarClientes(busqueda);

        return results.stream()
                .map(r -> new ClienteBusquedaDTO(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        (String) r[2]))
                .collect(Collectors.toList());
    }

    @Override
    public void activarCliente(Long id) {
        ClienteModel cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setEstado(true);
        clienteRepository.save(cliente);
    }

    @Override
    public ClienteModel cambiarTipoCliente(Long id, String nuevoTipo) {
        ClienteModel cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (!cliente.getEstado()) {
            throw new RuntimeException("No se puede cambiar el tipo de un cliente inactivo");
        }

        if (!nuevoTipo.equals("normal") && !nuevoTipo.equals("destacado")) {
            throw new RuntimeException("Tipo de cliente inválido");
        }

        cliente.setTipoCliente(nuevoTipo);

        return clienteRepository.save(cliente);
    }

}
