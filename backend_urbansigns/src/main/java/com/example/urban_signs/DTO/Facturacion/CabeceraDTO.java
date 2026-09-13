package com.example.urban_signs.DTO.Facturacion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CabeceraDTO {
    private String municipio = "Tarija";
    private String telefono = "+59112345678";
    private Integer codigoSucursal = 0;
    private String direccion = "AVENIDA LA PAZ (PRUEBA)"; // Puedes hacerlo dinámico si tienes dirección en Cliente
    private Integer codigoPuntoVenta = 0;
    private Integer codigoMetodoPago = 1; // 1 = Efectivo (Por defecto)
    private Integer codigoMoneda = 1; // 1 = Boliviano
    private Double tipoCambio = 1.0;
    private String usuario = "pperez";
    private Integer codigoDocumentoSector = 1;
    private Integer tipoFacturaDocumento = 1;
    private String leyenda = "Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilices.";

    // Datos Dinámicos (Se llenarán con el Pedido)
    private Long numeroFactura; // Lo calcularemos o enviaremos según lógica
    private String nombreRazonSocial; // Del Cliente
    private Integer codigoTipoDocumentoIdentidad; // 1=CI, 5=NIT (Del Cliente)
    private String numeroDocumento; // CI o NIT del Cliente
    private String complemento; // Opcional
    private String codigoCliente; // ID del cliente
    private String numeroTarjeta; // Null por defecto
    private Double montoTotal; // Total del Pedido
    private Double montoTotalMoneda; // Igual al total si es en Bolivianos
    private Double montoGiftCard = null;
    private Double descuentoAdicional = null;
    private String codigoExcepcion = null;
    private String cafc = null;
}