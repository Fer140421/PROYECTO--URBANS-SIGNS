package com.example.urban_signs.Model;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "roles")
public class RolesModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Long idRole;
    private String name_role;
    private boolean state;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "roles_permisos",
            joinColumns = @JoinColumn(name = "id_role"),
            inverseJoinColumns = @JoinColumn(name = "id_permiso"))
    @Builder.Default
    private Set<PermisoModel> permisos = new HashSet<>();
}
