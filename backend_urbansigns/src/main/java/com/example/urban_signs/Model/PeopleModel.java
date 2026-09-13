package com.example.urban_signs.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "people")
public class PeopleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_people;
    private String ci;
    private String name_people;
    private String ap;
    private String am;
    private String phone_number;
    private String addres;
}