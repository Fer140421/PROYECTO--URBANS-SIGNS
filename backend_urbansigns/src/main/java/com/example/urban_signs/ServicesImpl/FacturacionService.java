package com.example.urban_signs.ServicesImpl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import com.example.urban_signs.DTO.Facturacion.CabeceraDTO;
import com.example.urban_signs.DTO.Facturacion.DetalleDTO;
import com.example.urban_signs.DTO.Facturacion.FacturaRequestDTO;
import com.example.urban_signs.DTO.Facturacion.FacturaResponseDto;
import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionTrabajoModel;
import com.example.urban_signs.Model.EmpresaModel;
import com.example.urban_signs.Model.FacturacionModel;
import com.example.urban_signs.Model.PedidoModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Repository.FacturacionRepository;
import com.example.urban_signs.Repository.PedidosRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;

@Service
public class FacturacionService {

    @Value("${facturacion.api.url}")
    private String apiUrl;

    @Value("${facturacion.api.token}")
    private String apiToken;

    private final FacturacionRepository facturacionRepository;
    private final PedidosRepository pedidosRepository;

    public FacturacionService(FacturacionRepository facturacionRepository, PedidosRepository pedidosRepository) {
        this.facturacionRepository = facturacionRepository;
        this.pedidosRepository = pedidosRepository;
    }

    public FacturacionModel emitirFactura(Long idPedido) {

        // 1. Obtener el pedido de la BD
        PedidoModel pedido = pedidosRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // 2. Construir la Cabecera
        CabeceraDTO cabecera = new CabeceraDTO();

        // Calcular número de factura (Obtiene la última + 1, o empieza en 1)
        FacturacionModel ultimaFactura = facturacionRepository.findTopByOrderByIdDesc();
        long siguienteNumero = (ultimaFactura != null && ultimaFactura.getNumeroFacturaSiat() != null)
                ? ultimaFactura.getNumeroFacturaSiat() + 1
                : 1;
        cabecera.setNumeroFactura(siguienteNumero);

        // ============================
        // DATOS DEL CLIENTE
        // ============================
        ClienteModel cliente = pedido.getCliente();

        String nombreRazon;
        String numeroDocumento;

        if (cliente.getTipoClientePersonaEmpresa().equalsIgnoreCase("Empresa")) {

            EmpresaModel emp = cliente.getEmpresa();
            if (emp == null) {
                throw new RuntimeException("El cliente está marcado como Empresa pero no tiene datos de empresa.");
            }

            nombreRazon = emp.getRazonSocial();
            numeroDocumento = emp.getNit(); // NIT

        } else { // Persona

            PeopleModel per = cliente.getPersona();
            if (per == null) {
                throw new RuntimeException("El cliente está marcado como Persona pero no tiene datos de persona.");
            }

            nombreRazon = per.getName_people() + " " +
                    (per.getAp() != null ? per.getAp() : "") + " " +
                    (per.getAm() != null ? per.getAm() : "");

            numeroDocumento = per.getCi(); // CI
        }

        cabecera.setNombreRazonSocial(nombreRazon);
        cabecera.setNumeroDocumento(numeroDocumento);
        cabecera.setCodigoCliente(String.valueOf(cliente.getIdCliente()));

        // Tipo de documento SIAT
        // 1 = CI, 5 = NIT
        int tipoDoc = numeroDocumento.length() > 9 ? 5 : 1;
        cabecera.setCodigoTipoDocumentoIdentidad(tipoDoc);

        cabecera.setMontoTotal(pedido.getTotal().doubleValue());
        cabecera.setMontoTotalMoneda(pedido.getTotal().doubleValue());

        // ============================
        // DETALLE
        // ============================
        List<DetalleDTO> detalles = new ArrayList<>();

        for (CotizacionTrabajoModel trabajo : pedido.getCotizacion().getTrabajos()) {

            DetalleDTO det = new DetalleDTO();
            det.setCodigoProducto("PROD-" + trabajo.getIdCotizacionTrabajo());
            det.setDescripcion(trabajo.getSolicitudTrabajo().getTrabajo().getNombre());
            det.setCantidad(trabajo.getCantidad());
            det.setPrecioUnitario(trabajo.getCostoUnitario());
            det.setSubTotal(trabajo.getSubtotal());
            det.setMontoDescuento(BigDecimal.ZERO);

            detalles.add(det);
        }

        FacturaRequestDTO requestDTO = new FacturaRequestDTO();
        requestDTO.setCabecera(cabecera);
        requestDTO.setDetalle(detalles);

        // ============================
        // ENVÍO A SOFT-SOLUTION
        // ============================
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiToken);

        HttpEntity<FacturaRequestDTO> request = new HttpEntity<>(requestDTO, headers);

        ObjectMapper mapper = new ObjectMapper();
        String jsonString = "";
        try {
            jsonString = mapper.writeValueAsString(requestDTO);
        } catch (Exception e) {
            jsonString = "Error al convertir JSON";
        }

        try {
            FacturaResponseDto response = restTemplate.postForObject(apiUrl, request, FacturaResponseDto.class);

            // ============================
            // GUARDAR FACTURA
            // ============================
            FacturacionModel nuevaFactura = new FacturacionModel();
            nuevaFactura.setPedido(pedido);
            nuevaFactura.setCuf(response.getCuf());
            nuevaFactura.setNumeroFacturaSiat(response.getNumeroFactura());
            nuevaFactura.setUrlQr(response.getUrl());
            nuevaFactura.setEstado("VALIDA");
            nuevaFactura.setJsonEnviado(jsonString);
            nuevaFactura.setJsonRecibido(response.toString());

            return facturacionRepository.save(nuevaFactura);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al emitir factura: " + e.getMessage());
        }
    }

}