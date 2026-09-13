package com.example.urban_signs.Model;

import jakarta.persistence.Entity;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpresaModel {
  @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long idEmpresa;

    @Column(name = "razon_social", nullable = false, length = 150)
    private String razonSocial;

    @Column(nullable = false, unique = true, length = 20)
    private String nit;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(length = 20)
    private String telefono;
}
