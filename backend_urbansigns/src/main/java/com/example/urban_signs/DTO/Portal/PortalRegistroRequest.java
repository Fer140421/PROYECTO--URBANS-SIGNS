package com.example.urban_signs.DTO.Portal;

public record PortalRegistroRequest(String tipoCliente, String ci, String namePeople, String ap, String am,
        String razonSocial, String nit, String direccion, String phone, String email, String password,
        String verificationCode) {}
