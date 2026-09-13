package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "categorias")
public class CategorysModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "id_categoria")
    private Long idCategoria;

    @Column(name = "nombre", nullable = false, length = 50, unique = true)
    private String nombre;

    @Column(name = "descripcion", length = 50)
    private String descripcion;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

}