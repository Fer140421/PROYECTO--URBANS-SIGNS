package com.example.urban_signs.Controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.urban_signs.DTO.Facturacion.FacturacionDTO;
import com.example.urban_signs.DTO.Facturacion.FacturacionImprimirDTO;
import com.example.urban_signs.DTO.Facturacion.FacturacionRequestDTO;
import com.example.urban_signs.Model.FacturacionModel;
import com.example.urban_signs.Repository.FacturacionRepository;
import com.example.urban_signs.ServicesImpl.FacturacionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/facturacion")
@RequiredArgsConstructor
public class FacturacionController {

	private final FacturacionService facturacionService;
	private final FacturacionRepository facturacionRepository;

	@PostMapping("/emitir/{idPedido}")
	@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('FACTURACION_CREAR')")
	public ResponseEntity<?> emitirFactura(@PathVariable Long idPedido) {
		try {
			FacturacionModel factura = facturacionService.emitirFactura(idPedido);
			return ResponseEntity.ok(factura);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("Error al emitir factura: " + e.getMessage());
		}
	}

	@GetMapping("/pedido/{idPedido}")
	@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('FACTURACION_VER')")
	public ResponseEntity<?> obtenerFacturaPorPedido(@PathVariable Long idPedido) {
		FacturacionModel factura = facturacionRepository.findByPedido_IdPedido(idPedido);

		if (factura != null) {
			return ResponseEntity.ok(factura);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

}
