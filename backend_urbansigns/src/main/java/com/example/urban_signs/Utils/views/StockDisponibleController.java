package com.example.urban_signs.Utils.views;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente') or hasAuthority('MATERIAL_VER')")
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockDisponibleController {
  private final StockDisponibleService service;

  @GetMapping("/disponible")
  public Page<StockDisponible> obtenerStock(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String nombre) {

    return service.listarStock(page, size, nombre);
  }
}
