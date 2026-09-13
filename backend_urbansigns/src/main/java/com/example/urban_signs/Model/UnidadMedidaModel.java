package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "unidades_medida")
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UnidadMedidaModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad")
    private Long idUnidad;

    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "abreviatura", nullable = false, unique = true, length = 10)
    private String abreviatura;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;
}