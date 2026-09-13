package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "employees")
public class EmployeeModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_employee")
    private Long idEmployee;

    @ManyToOne
    @JoinColumn(name = "id_people", nullable = false)
    private PeopleModel people;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "foto")
    private String foto;

    @Column(name = "status")
    private Boolean status;

    @PrePersist
    protected void onCreate() {
        this.hireDate = LocalDate.now(ZoneId.of("America/La_Paz"));
    }
}