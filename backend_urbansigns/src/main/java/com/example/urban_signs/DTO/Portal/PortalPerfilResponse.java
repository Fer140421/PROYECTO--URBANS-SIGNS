package com.example.urban_signs.DTO.Portal;

/**
 * Datos de perfil que el portal de clientes puede mostrar.
 * No incluye contrasena, permisos internos ni entidades de persistencia.
 */
public record PortalPerfilResponse(
        Long idCliente,
        String tipoCliente,
        String nombre,
        String correo,
        String telefono) {
}
