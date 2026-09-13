package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "suppliers")
public class SupplierModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_supplier")
    private Long idSupplier;

    @ManyToOne
    @JoinColumn(name = "id_people", nullable = false)
    private PeopleModel people;

    private String city;

    private Boolean status;
}