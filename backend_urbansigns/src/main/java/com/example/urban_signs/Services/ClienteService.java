package com.example.urban_signs.Services;

import java.util.List;

import org.springframework.data.domain.Page;

import com.example.urban_signs.DTO.Clientes.ClienteBusquedaDTO;
import com.example.urban_signs.Model.ClienteModel;

public interface ClienteService {
    ClienteModel registrarCliente(ClienteModel cliente);

    ClienteModel actualizarCliente(Long id, ClienteModel cliente);

    ClienteModel obtenerClientePorId(Long id);

    Page<ClienteModel> listarClientesPaginados(
            int page,
            int size,
            String nombre,
            Boolean estado,
            String tipoPersonaEmpresa,
            String categoria);

    void eliminarCliente(Long id);

    List<ClienteBusquedaDTO> buscarClientes(String busqueda);

    void activarCliente(Long id);

    ClienteModel cambiarTipoCliente(Long id, String nuevoTipo);

}
