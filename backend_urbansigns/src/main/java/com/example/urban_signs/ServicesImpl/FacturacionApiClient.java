package com.example.urban_signs.ServicesImpl;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.urban_signs.DTO.Facturacion.FacturaRequestDTO;

public class FacturacionApiClient {

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiToken;

    public FacturacionApiClient(RestTemplate restTemplate, String apiUrl, String apiToken) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiToken = apiToken;
    }

    public ResponseEntity<String> enviarFactura(FacturaRequestDTO request) throws HttpClientErrorException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiToken != null && !apiToken.isEmpty()) {
            headers.setBearerAuth(apiToken);
        }
        HttpEntity<FacturaRequestDTO> entity = new HttpEntity<>(request, headers);
        return restTemplate.postForEntity(apiUrl, entity, String.class);
    }
}